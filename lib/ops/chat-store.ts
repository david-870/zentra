import { postgresClient, postgresConfigured } from "@/lib/ops/enquiry-postgres";

export type ChatControl = "AI" | "HUMAN";

export type ChatConversation = {
  id: string;
  contactId: string;
  control: ChatControl;
  stage: string;
  contextJson: string;
};

export type ChatLead = {
  id: string;
  score: number;
  status: string;
  name: string;
  businessName: string;
  phone: string;
  packageInterest: string;
  serviceInterest: string;
  problem: string;
  lastMessage: string;
};

export const PACKAGE_FEATURES: Record<string, string> = {
  starter:
    "A professional website that works on a phone; A simple way for customers to contact you; WhatsApp on your site; A setup that can answer common questions when you are busy; A form so enquiries are not lost; We put the site live for you",
  growth:
    "A full website; WhatsApp or Instagram replies so messages do not pile up; Capture and keep track of leads; A simple customer list; Automate repetitive tasks; Launch and training for your team",
  scale:
    "A custom website or web application; WhatsApp and Instagram as part of one system; A customer system your team can run; Automate work across people, chats and spreadsheets; Dashboards; Launch, handover and training",
};

function sql() {
  return postgresClient();
}

async function ensureChatTables() {
  const client = sql();
  if (!client) throw new Error("Postgres is not configured for WhatsApp chats.");
  await client`
    CREATE TABLE IF NOT EXISTS wa_processed_events (
      id text PRIMARY KEY,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await client`
    CREATE TABLE IF NOT EXISTS wa_contacts (
      id text PRIMARY KEY,
      wa_id text NOT NULL UNIQUE,
      phone text NOT NULL,
      name text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await client`
    CREATE TABLE IF NOT EXISTS wa_conversations (
      id text PRIMARY KEY,
      contact_id text NOT NULL,
      control text NOT NULL DEFAULT 'AI',
      stage text NOT NULL DEFAULT 'welcome',
      context_json text NOT NULL DEFAULT '{}',
      handoff_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await client`
    CREATE TABLE IF NOT EXISTS wa_messages (
      id text PRIMARY KEY,
      conversation_id text NOT NULL,
      wa_message_id text UNIQUE,
      direction text NOT NULL,
      author text NOT NULL,
      text text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await client`
    CREATE TABLE IF NOT EXISTS wa_leads (
      id text PRIMARY KEY,
      contact_id text NOT NULL,
      conversation_id text NOT NULL UNIQUE,
      name text,
      phone text NOT NULL,
      business_name text,
      business_description text,
      problem text,
      service_interest text,
      package_interest text,
      budget_range text,
      source text NOT NULL DEFAULT 'whatsapp',
      score integer NOT NULL DEFAULT 0,
      status text NOT NULL DEFAULT 'NEW',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await client`
    CREATE TABLE IF NOT EXISTS wa_followups (
      id text PRIMARY KEY,
      lead_id text NOT NULL,
      offset_days integer NOT NULL,
      template text NOT NULL,
      scheduled_at timestamptz NOT NULL,
      sent_at timestamptz,
      cancelled boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  return client;
}

export function chatStoreReady() {
  return postgresConfigured();
}

export async function claimEvent(id: string) {
  const client = await ensureChatTables();
  try {
    await client`INSERT INTO wa_processed_events (id) VALUES (${id})`;
    return true;
  } catch {
    return false;
  }
}

export async function releaseEvent(id: string) {
  const client = await ensureChatTables();
  await client`DELETE FROM wa_processed_events WHERE id = ${id}`;
}

export async function messageExists(waMessageId: string) {
  const client = await ensureChatTables();
  const rows = (await client`
    SELECT id FROM wa_messages WHERE wa_message_id = ${waMessageId} LIMIT 1
  `) as { id?: string }[];
  return Boolean(rows[0]?.id);
}

export async function upsertContact(waId: string, phone: string, name?: string) {
  const client = await ensureChatTables();
  const existing = (await client`
    SELECT id FROM wa_contacts WHERE wa_id = ${waId} LIMIT 1
  `) as { id?: string }[];
  if (existing[0]?.id) {
    await client`
      UPDATE wa_contacts
      SET phone = ${phone}, name = COALESCE(${name ?? null}, name), updated_at = now()
      WHERE id = ${existing[0].id}
    `;
    return existing[0].id;
  }
  const id = crypto.randomUUID();
  await client`
    INSERT INTO wa_contacts (id, wa_id, phone, name)
    VALUES (${id}, ${waId}, ${phone}, ${name ?? null})
  `;
  return id;
}

export async function getOrCreateConversation(contactId: string): Promise<ChatConversation> {
  const client = await ensureChatTables();
  const rows = (await client`
    SELECT id, contact_id, control, stage, context_json
    FROM wa_conversations
    WHERE contact_id = ${contactId}
    ORDER BY created_at DESC
    LIMIT 1
  `) as Record<string, unknown>[];
  if (rows[0]) {
    return {
      id: String(rows[0].id),
      contactId: String(rows[0].contact_id),
      control: String(rows[0].control) === "HUMAN" ? "HUMAN" : "AI",
      stage: String(rows[0].stage ?? "welcome"),
      contextJson: String(rows[0].context_json ?? "{}"),
    };
  }
  const id = crypto.randomUUID();
  await client`
    INSERT INTO wa_conversations (id, contact_id)
    VALUES (${id}, ${contactId})
  `;
  return { id, contactId, control: "AI", stage: "welcome", contextJson: "{}" };
}

export async function addMessage(
  conversationId: string,
  input: { waMessageId?: string; direction: "IN" | "OUT"; author: "CUSTOMER" | "AI" | "HUMAN"; text: string },
) {
  const client = await ensureChatTables();
  await client`
    INSERT INTO wa_messages (id, conversation_id, wa_message_id, direction, author, text)
    VALUES (${crypto.randomUUID()}, ${conversationId}, ${input.waMessageId ?? null}, ${input.direction}, ${input.author}, ${input.text})
  `;
}

export async function saveConversation(
  conversationId: string,
  input: { contextJson?: string; stage?: string; control?: ChatControl; handoff?: boolean },
) {
  const client = await ensureChatTables();
  await client`
    UPDATE wa_conversations
    SET
      context_json = COALESCE(${input.contextJson ?? null}, context_json),
      stage = COALESCE(${input.stage ?? null}, stage),
      control = COALESCE(${input.control ?? null}, control),
      handoff_at = CASE WHEN ${input.handoff ?? false} THEN now() ELSE handoff_at END,
      updated_at = now()
    WHERE id = ${conversationId}
  `;
}

export async function upsertLead(
  contactId: string,
  conversationId: string,
  phone: string,
  data: {
    name?: string;
    businessName?: string;
    businessDescription?: string;
    problem?: string;
    serviceInterest?: string;
    packageInterest?: string;
    budgetRange?: string;
    source?: string;
    score: number;
    status: string;
  },
) {
  const client = await ensureChatTables();
  const existing = (await client`
    SELECT id, score, status FROM wa_leads WHERE conversation_id = ${conversationId} LIMIT 1
  `) as { id?: string; score?: number; status?: string }[];
  if (existing[0]?.id) {
    await client`
      UPDATE wa_leads
      SET
        name = COALESCE(${data.name ?? null}, name),
        phone = ${phone},
        business_name = COALESCE(${data.businessName ?? null}, business_name),
        business_description = COALESCE(${data.businessDescription ?? null}, business_description),
        problem = COALESCE(${data.problem ?? null}, problem),
        service_interest = COALESCE(${data.serviceInterest ?? null}, service_interest),
        package_interest = COALESCE(${data.packageInterest ?? null}, package_interest),
        budget_range = COALESCE(${data.budgetRange ?? null}, budget_range),
        source = COALESCE(${data.source ?? null}, source),
        score = ${data.score},
        status = ${data.status},
        updated_at = now()
      WHERE id = ${existing[0].id}
    `;
    return { id: existing[0].id, score: data.score, status: data.status };
  }
  const id = crypto.randomUUID();
  await client`
    INSERT INTO wa_leads (
      id, contact_id, conversation_id, name, phone, business_name, business_description,
      problem, service_interest, package_interest, budget_range, source, score, status
    )
    VALUES (
      ${id}, ${contactId}, ${conversationId}, ${data.name ?? null}, ${phone}, ${data.businessName ?? null},
      ${data.businessDescription ?? null}, ${data.problem ?? null}, ${data.serviceInterest ?? null},
      ${data.packageInterest ?? null}, ${data.budgetRange ?? null}, ${data.source ?? "whatsapp"}, ${data.score}, ${data.status}
    )
  `;
  return { id, score: data.score, status: data.status };
}

export async function getLeadByConversation(conversationId: string) {
  const client = await ensureChatTables();
  const rows = (await client`
    SELECT id, score, status FROM wa_leads WHERE conversation_id = ${conversationId} LIMIT 1
  `) as { id?: string; score?: number; status?: string }[];
  if (!rows[0]?.id) return null;
  return { id: rows[0].id, score: Number(rows[0].score ?? 0), status: String(rows[0].status ?? "NEW") };
}

export async function scheduleFollowUps(leadId: string, name: string) {
  const client = await ensureChatTables();
  const existing = (await client`SELECT id FROM wa_followups WHERE lead_id = ${leadId} LIMIT 1`) as { id?: string }[];
  if (existing[0]?.id) return;
  const now = Date.now();
  const templates = [
    { days: 1, text: `Hi ${name}, just checking in about the project we discussed. Do you have any questions I can help with?` },
    { days: 3, text: `Hi ${name}, would you like us to put together a simple direction for how we'd approach your project?` },
    { days: 7, text: `Hi ${name}, just checking in one last time. If you're still exploring the project, we're happy to help.` },
  ];
  for (const item of templates) {
    await client`
      INSERT INTO wa_followups (id, lead_id, offset_days, template, scheduled_at)
      VALUES (
        ${crypto.randomUUID()},
        ${leadId},
        ${item.days},
        ${item.text},
        ${new Date(now + item.days * 24 * 60 * 60 * 1000).toISOString()}
      )
    `;
  }
}

export async function cancelFollowUps(leadId: string) {
  const client = await ensureChatTables();
  await client`
    UPDATE wa_followups
    SET cancelled = true
    WHERE lead_id = ${leadId} AND sent_at IS NULL
  `;
}

export async function listChatLeads(): Promise<ChatLead[]> {
  if (!postgresConfigured()) return [];
  const client = await ensureChatTables();
  const rows = (await client`
    SELECT
      l.id, l.score, l.status, l.name, l.business_name, l.phone,
      l.package_interest, l.service_interest, l.problem,
      (
        SELECT m.text FROM wa_messages m
        WHERE m.conversation_id = l.conversation_id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) AS last_message
    FROM wa_leads l
    ORDER BY l.updated_at DESC
    LIMIT 100
  `) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: String(row.id),
    score: Number(row.score ?? 0),
    status: String(row.status ?? "NEW"),
    name: String(row.name ?? ""),
    businessName: String(row.business_name ?? ""),
    phone: String(row.phone ?? ""),
    packageInterest: String(row.package_interest ?? ""),
    serviceInterest: String(row.service_interest ?? ""),
    problem: String(row.problem ?? ""),
    lastMessage: String(row.last_message ?? ""),
  }));
}

export async function getChatLead(id: string) {
  if (!postgresConfigured()) return null;
  const client = await ensureChatTables();
  const leads = (await client`
    SELECT
      l.id, l.conversation_id, l.score, l.status, l.name, l.business_name, l.phone,
      l.package_interest, l.service_interest, l.problem, l.budget_range, l.created_at,
      c.control
    FROM wa_leads l
    JOIN wa_conversations c ON c.id = l.conversation_id
    WHERE l.id = ${id}
    LIMIT 1
  `) as Record<string, unknown>[];
  const lead = leads[0];
  if (!lead) return null;
  const messages = (await client`
    SELECT direction, author, text, created_at
    FROM wa_messages
    WHERE conversation_id = ${String(lead.conversation_id)}
    ORDER BY created_at ASC
    LIMIT 80
  `) as Record<string, unknown>[];
  return {
    id: String(lead.id),
    conversationId: String(lead.conversation_id),
    control: String(lead.control) === "HUMAN" ? ("HUMAN" as const) : ("AI" as const),
    score: Number(lead.score ?? 0),
    status: String(lead.status ?? "NEW"),
    name: String(lead.name ?? ""),
    businessName: String(lead.business_name ?? ""),
    phone: String(lead.phone ?? ""),
    packageInterest: String(lead.package_interest ?? ""),
    serviceInterest: String(lead.service_interest ?? ""),
    problem: String(lead.problem ?? ""),
    budgetRange: String(lead.budget_range ?? ""),
    createdAt: new Date(String(lead.created_at)),
    messages: messages.map((item) => ({
      direction: String(item.direction),
      author: String(item.author),
      text: String(item.text),
      createdAt: new Date(String(item.created_at)),
    })),
  };
}

export async function setChatLeadControl(leadId: string, control: ChatControl) {
  const lead = await getChatLead(leadId);
  if (!lead) return null;
  const client = await ensureChatTables();
  await saveConversation(lead.conversationId, { control, handoff: control === "HUMAN" });
  const status = control === "HUMAN" ? "HUMAN_HANDOFF" : lead.status === "HUMAN_HANDOFF" ? "QUALIFYING" : lead.status;
  await client`
    UPDATE wa_leads
    SET status = ${status}, updated_at = now()
    WHERE id = ${leadId}
  `;
  return { ...lead, control, status };
}
