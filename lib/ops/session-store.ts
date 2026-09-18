import { postgresClient } from "@/lib/ops/enquiry-postgres";

async function ensureSessionsTable() {
  const sql = postgresClient();
  if (!sql) return null;
  await sql`
    CREATE TABLE IF NOT EXISTS ops_sessions (
      id text PRIMARY KEY,
      created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL
    )
  `;
  return sql;
}

export async function createOpsSession() {
  const sql = await ensureSessionsTable();
  if (!sql) return null;
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  await sql`
    INSERT INTO ops_sessions (id, expires_at)
    VALUES (${id}, ${expiresAt.toISOString()})
  `;
  return id;
}

export async function opsSessionValid(id: string) {
  if (!id) return false;
  const sql = await ensureSessionsTable();
  if (!sql) return false;
  const rows = (await sql`
    SELECT id FROM ops_sessions
    WHERE id = ${id} AND expires_at > now()
    LIMIT 1
  `) as { id?: string }[];
  return Boolean(rows[0]?.id);
}

export async function deleteOpsSession(id: string) {
  const sql = await ensureSessionsTable();
  if (!sql || !id) return;
  await sql`DELETE FROM ops_sessions WHERE id = ${id}`;
}
