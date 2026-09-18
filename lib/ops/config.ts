export const opsConfig = {
  get appUrl() {
    return process.env.APP_URL ?? "http://localhost:3000";
  },
  get webhookUrl() {
    return process.env.WEBHOOK_URL ?? "http://localhost:3000/api/whatsapp/webhook";
  },
  whatsapp: {
    get accessToken() {
      return process.env.WHATSAPP_ACCESS_TOKEN ?? "";
    },
    get phoneNumberId() {
      return process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";
    },
    get businessAccountId() {
      return process.env.WHATSAPP_BUSINESS_ACCOUNT_ID ?? "";
    },
    get verifyToken() {
      return process.env.WHATSAPP_VERIFY_TOKEN ?? "";
    },
    get appSecret() {
      return process.env.WHATSAPP_APP_SECRET ?? "";
    },
  },
  ai: {
    get apiKey() {
      return process.env.AI_API_KEY ?? "";
    },
    get baseUrl() {
      return process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
    },
    get model() {
      return process.env.AI_MODEL ?? "gpt-4o-mini";
    },
  },
  ops: {
    get email() {
      return (process.env.OPS_EMAIL ?? "david@zentra.local").toLowerCase();
    },
    get password() {
      return process.env.OPS_PASSWORD || process.env.WHATSAPP_VERIFY_TOKEN || "";
    },
    get notifyPhone() {
      return process.env.OPS_NOTIFY_PHONE ?? "";
    },
  },
  get cronSecret() {
    return process.env.CRON_SECRET ?? "";
  },
};

export function opsPasswordReady() {
  return opsConfig.ops.password.length >= 8;
}
