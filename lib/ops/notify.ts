import { db } from "@/lib/ops/db";

/** Dashboard notifications. Email/Slack/Telegram can subscribe here later. */
export async function notify(input: { type: string; title: string; body: string; leadId?: string }) {
  await db.notification.create({ data: input });
}
