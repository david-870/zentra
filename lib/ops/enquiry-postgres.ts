import { neon } from "@neondatabase/serverless";

export const ENQUIRY_STATUSES = ["NEW", "QUALIFIED", "FOLLOW_UP", "WON", "LOST"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export type WebsiteEnquiry = {
  id: string;
  name: string;
  business: string;
  need: string;
  contact: string;
  phone: string;
  email: string;
  website: string;
  status: EnquiryStatus;
  notes: string;
  followUpAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  notifiedAt: Date | null;
  notifyError: string | null;
  emailNotifiedAt: Date | null;
  emailNotifyError: string | null;
};

function isPostgresUrl(value?: string) {
  return Boolean(value && /^postgres(ql)?:\/\//i.test(value));
}

function postgresUrl() {
  const preferred = [
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL",
    "POSTGRES_DATABASE_URL",
    "POSTGRES_URL_NON_POOLING",
    "POSTGRES_DATABASE_URL_UNPOOLED",
    "DATABASE_URL_UNPOOLED",
    "DATABASE_URL",
  ];

  for (const key of preferred) {
    const value = process.env[key];
    if (isPostgresUrl(value)) return value as string;
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (!/(POSTGRES|DATABASE|NEON|STORAGE)/i.test(key)) continue;
    if (isPostgresUrl(value)) return value as string;
  }

  return "";
}

export function postgresConfigured() {
  return Boolean(postgresUrl());
}

export function postgresClient() {
  const url = postgresUrl();
  if (!url) return null;
  return neon(url);
}

function client() {
  return postgresClient();
}

export function splitContact(contact: string, phone = "", email = "", website = "") {
  if (phone || email || website) {
    return { phone, email, website };
  }

  const parts = contact.split("·").map((part) => part.trim()).filter(Boolean);
  const foundEmail = parts.find((part) => part.includes("@")) ?? "";
  const foundPhone = parts.find((part) => part.replace(/\D/g, "").length >= 10 && !part.includes("@")) ?? "";
  const foundWebsite = parts.find((part) => part !== foundEmail && part !== foundPhone) ?? "";
  return { phone: foundPhone, email: foundEmail, website: foundWebsite };
}

async function ensureEnquiryTable(sql: NonNullable<ReturnType<typeof client>>) {
  await sql`
    CREATE TABLE IF NOT EXISTS website_enquiries (
      id text PRIMARY KEY,
      name text NOT NULL,
      business text NOT NULL,
      need text NOT NULL,
      contact text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`ALTER TABLE website_enquiries ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE website_enquiries ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE website_enquiries ADD COLUMN IF NOT EXISTS website text NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE website_enquiries ADD COLUMN IF NOT EXISTS notified_at timestamptz`;
  await sql`ALTER TABLE website_enquiries ADD COLUMN IF NOT EXISTS notify_error text`;
  await sql`ALTER TABLE website_enquiries ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'NEW'`;
  await sql`ALTER TABLE website_enquiries ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE website_enquiries ADD COLUMN IF NOT EXISTS follow_up_at timestamptz`;
  await sql`ALTER TABLE website_enquiries ADD COLUMN IF NOT EXISTS archived_at timestamptz`;
  await sql`ALTER TABLE website_enquiries ADD COLUMN IF NOT EXISTS email_notified_at timestamptz`;
  await sql`ALTER TABLE website_enquiries ADD COLUMN IF NOT EXISTS email_notify_error text`;
}

function asStatus(value: unknown): EnquiryStatus {
  const status = String(value ?? "NEW").toUpperCase();
  return (ENQUIRY_STATUSES as readonly string[]).includes(status) ? (status as EnquiryStatus) : "NEW";
}

function mapRow(row: Record<string, unknown>): WebsiteEnquiry {
  const contact = String(row.contact ?? "");
  const parsed = splitContact(
    contact,
    String(row.phone ?? ""),
    String(row.email ?? ""),
    String(row.website ?? ""),
  );

  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    business: String(row.business ?? ""),
    need: String(row.need ?? ""),
    contact,
    phone: parsed.phone,
    email: parsed.email,
    website: parsed.website,
    status: asStatus(row.status),
    notes: String(row.notes ?? ""),
    followUpAt: row.follow_up_at ? new Date(String(row.follow_up_at)) : null,
    archivedAt: row.archived_at ? new Date(String(row.archived_at)) : null,
    createdAt: new Date(String(row.created_at ?? Date.now())),
    notifiedAt: row.notified_at ? new Date(String(row.notified_at)) : null,
    notifyError: row.notify_error ? String(row.notify_error) : null,
    emailNotifiedAt: row.email_notified_at ? new Date(String(row.email_notified_at)) : null,
    emailNotifyError: row.email_notify_error ? String(row.email_notify_error) : null,
  };
}

export async function persistWebsiteEnquiryPostgres(input: {
  name: string;
  business: string;
  need: string;
  contact: string;
  phone?: string;
  email?: string;
  website?: string;
}) {
  const sql = client();
  if (!sql) {
    const keys = Object.keys(process.env).filter((key) => /(POSTGRES|DATABASE|NEON|STORAGE)/i.test(key));
    console.error("enquiry postgres: no postgres url in env", keys);
    return null;
  }

  await ensureEnquiryTable(sql);

  const parsed = splitContact(input.contact, input.phone, input.email, input.website);
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO website_enquiries (id, name, business, need, contact, phone, email, website)
    VALUES (
      ${id},
      ${input.name},
      ${input.business},
      ${input.need},
      ${input.contact},
      ${parsed.phone},
      ${parsed.email},
      ${parsed.website}
    )
  `;
  return id;
}

export async function listWebsiteEnquiries(limit = 100) {
  const sql = client();
  if (!sql) return [];
  try {
    await ensureEnquiryTable(sql);
    const rows = (await sql`
      SELECT id, name, business, need, contact, phone, email, website, status, notes, follow_up_at, archived_at, created_at, notified_at, notify_error, email_notified_at, email_notify_error
      FROM website_enquiries
      ORDER BY created_at DESC
      LIMIT ${limit}
    `) as Record<string, unknown>[];
    return rows.map(mapRow);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getWebsiteEnquiry(id: string) {
  const sql = client();
  if (!sql) return null;
  try {
    await ensureEnquiryTable(sql);
    const rows = (await sql`
      SELECT id, name, business, need, contact, phone, email, website, status, notes, follow_up_at, archived_at, created_at, notified_at, notify_error, email_notified_at, email_notify_error
      FROM website_enquiries
      WHERE id = ${id}
      LIMIT 1
    `) as Record<string, unknown>[];
    return rows[0] ? mapRow(rows[0]) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function markEnquiryNotified(id: string, error?: string) {
  const sql = client();
  if (!sql) return;
  try {
    await ensureEnquiryTable(sql);
    if (error) {
      await sql`
        UPDATE website_enquiries
        SET notify_error = ${error.slice(0, 400)}
        WHERE id = ${id}
      `;
      return;
    }
    await sql`
      UPDATE website_enquiries
      SET notified_at = now(), notify_error = NULL
      WHERE id = ${id}
    `;
  } catch (caught) {
    console.error(caught);
  }
}

export async function markEnquiryEmailNotified(id: string, error?: string) {
  const sql = client();
  if (!sql) return;
  try {
    await ensureEnquiryTable(sql);
    if (error) {
      await sql`
        UPDATE website_enquiries
        SET email_notify_error = ${error.slice(0, 400)}
        WHERE id = ${id}
      `;
      return;
    }
    await sql`
      UPDATE website_enquiries
      SET email_notified_at = now(), email_notify_error = NULL
      WHERE id = ${id}
    `;
  } catch (caught) {
    console.error(caught);
  }
}

export async function updateWebsiteEnquiry(
  id: string,
  input: {
    status: EnquiryStatus;
    notes: string;
    followUpAt: Date | null;
  },
) {
  const sql = client();
  if (!sql) return;
  await ensureEnquiryTable(sql);
  await sql`
    UPDATE website_enquiries
    SET
      status = ${input.status},
      notes = ${input.notes.slice(0, 4000)},
      follow_up_at = ${input.followUpAt ? input.followUpAt.toISOString() : null}
    WHERE id = ${id}
  `;
}

export async function setWebsiteEnquiryArchived(id: string, archived: boolean) {
  const sql = client();
  if (!sql) return;
  await ensureEnquiryTable(sql);
  if (archived) {
    await sql`UPDATE website_enquiries SET archived_at = now() WHERE id = ${id}`;
    return;
  }
  await sql`UPDATE website_enquiries SET archived_at = NULL WHERE id = ${id}`;
}
