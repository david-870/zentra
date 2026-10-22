import { createHash } from "node:crypto";
import { postgresClient } from "@/lib/ops/enquiry-postgres";

// Shared across serverless instances. Failure must never bypass the login limit.
export async function loginRateLimit(ip: string) {
  const sql = postgresClient();
  if (!sql) throw new Error("Login storage unavailable");
  await sql`CREATE TABLE IF NOT EXISTS ops_login_limits (
    key text PRIMARY KEY, count integer NOT NULL, reset_at timestamptz NOT NULL
  )`;
  const key = createHash("sha256").update(`ops-login:${ip}`).digest("hex");
  const rows = await sql`
    INSERT INTO ops_login_limits (key, count, reset_at)
    VALUES (${key}, 1, now() + interval '10 minutes')
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN ops_login_limits.reset_at <= now() THEN 1 ELSE ops_login_limits.count + 1 END,
      reset_at = CASE WHEN ops_login_limits.reset_at <= now() THEN now() + interval '10 minutes' ELSE ops_login_limits.reset_at END
    RETURNING count
  `;
  await sql`DELETE FROM ops_login_limits WHERE reset_at < now() - interval '1 day'`;
  return Number(rows[0]?.count) <= 12;
}
