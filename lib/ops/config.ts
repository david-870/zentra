function clean(value?: string) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/^(['"])(.*)\1$/, "$2").trim();
}

export const opsConfig = {
  get appUrl() {
    return clean(process.env.APP_URL) || "http://localhost:3000";
  },
  get webhookUrl() {
    return clean(process.env.WEBHOOK_URL) || "http://localhost:3000/api/whatsapp/webhook";
  },
  whatsapp: {
    get accessToken() {
      return clean(process.env.WHATSAPP_ACCESS_TOKEN);
    },
    get phoneNumberId() {
      return clean(process.env.WHATSAPP_PHONE_NUMBER_ID);
    },
    get businessAccountId() {
      return clean(process.env.WHATSAPP_BUSINESS_ACCOUNT_ID);
    },
    get verifyToken() {
      return clean(process.env.WHATSAPP_VERIFY_TOKEN);
    },
    get appSecret() {
      return clean(process.env.WHATSAPP_APP_SECRET);
    },
  },
  ai: {
    get apiKey() {
      return clean(process.env.AI_API_KEY);
    },
    get baseUrl() {
      return clean(process.env.AI_BASE_URL) || "https://api.openai.com/v1";
    },
    get model() {
      return clean(process.env.AI_MODEL) || "gpt-4o-mini";
    },
  },
  ops: {
    get email() {
      return (clean(process.env.OPS_EMAIL) || "david@zentra.local").toLowerCase();
    },
    get password() {
      return clean(process.env.OPS_PASSWORD);
    },
    get notifyPhone() {
      return clean(process.env.OPS_NOTIFY_PHONE);
    },
  },
  get cronSecret() {
    return clean(process.env.CRON_SECRET);
  },
};

export function opsPasswordReady() {
  return opsConfig.ops.password.length >= 8;
}
