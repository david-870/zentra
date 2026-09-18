export const opsConfig = {
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  webhookUrl: process.env.WEBHOOK_URL ?? "http://localhost:3000/api/whatsapp/webhook",
  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID ?? "",
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? "",
    appSecret: process.env.WHATSAPP_APP_SECRET ?? "",
  },
  ai: {
    apiKey: process.env.AI_API_KEY ?? "",
    baseUrl: process.env.AI_BASE_URL ?? "https://api.openai.com/v1",
    model: process.env.AI_MODEL ?? "gpt-4o-mini",
  },
  ops: {
    email: process.env.OPS_EMAIL ?? "david@zentra.local",
    password: process.env.OPS_PASSWORD || process.env.WHATSAPP_VERIFY_TOKEN || "",
    notifyPhone: process.env.OPS_NOTIFY_PHONE ?? "",
  },
  cronSecret: process.env.CRON_SECRET ?? "",
};

export function opsPasswordReady() {
  return opsConfig.ops.password.length >= 8;
}
