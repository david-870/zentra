import { neon } from "@neondatabase/serverless";

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

export async function persistWebsiteEnquiryPostgres(input: {
  name: string;
  business: string;
  need: string;
  contact: string;
}) {
  const url = postgresUrl();
  if (!url) {
    const keys = Object.keys(process.env).filter((key) => /(POSTGRES|DATABASE|NEON|STORAGE)/i.test(key));
    console.error("enquiry postgres: no postgres url in env", keys);
    return null;
  }

  const sql = neon(url);
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

  const id = crypto.randomUUID();
  await sql`
    INSERT INTO website_enquiries (id, name, business, need, contact)
    VALUES (${id}, ${input.name}, ${input.business}, ${input.need}, ${input.contact})
  `;
  return id;
}
