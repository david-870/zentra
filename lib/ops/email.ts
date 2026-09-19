import { opsConfig } from "@/lib/ops/config";

export function emailNotifyConfigured() {
  return Boolean(opsConfig.email.apiKey && opsConfig.ops.notifyEmail.includes("@"));
}

export async function sendOpsEmail(subject: string, text: string) {
  const apiKey = opsConfig.email.apiKey || String(process.env.RESEND_API_KEY ?? "").trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is empty. Add it in Vercel, save, then send a new enquiry.");
  }
  const to = opsConfig.ops.notifyEmail || String(process.env.OPS_NOTIFY_EMAIL ?? "").trim().toLowerCase();
  if (!to.includes("@") || to.endsWith("@zentra.local")) {
    throw new Error("OPS_NOTIFY_EMAIL is empty. Add the Gmail or inbox you actually read.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: opsConfig.email.from,
      to: [to],
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Email send failed: ${response.status} ${detail.slice(0, 240)}`);
  }
}
