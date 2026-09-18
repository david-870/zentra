import { neon } from "@neondatabase/serverless";

function postgresUrl() {
  for (const value of [
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.DATABASE_URL,
  ]) {
    if (value?.startsWith("postgres")) return value;
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
  if (!url) return null;

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
