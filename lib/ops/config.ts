import { readEnv } from "@/lib/ops/env";

export const opsConfig = {
  get appUrl() {
    return readEnv("APP_URL") || "http://localhost:3000";
  },
  get webhookUrl() {
    return readEnv("WEBHOOK_URL") || "http://localhost:3000/api/whatsapp/webhook";
  },
  whatsapp: {
    get accessToken() {
      return readEnv("WHATSAPP_ACCESS_TOKEN");
    },
    get phoneNumberId() {
      return readEnv("WHATSAPP_PHONE_NUMBER_ID");
    },
    get businessAccountId() {
      return readEnv("WHATSAPP_BUSINESS_ACCOUNT_ID");
    },
    get verifyToken() {
      return readEnv("WHATSAPP_VERIFY_TOKEN");
    },
    get appSecret() {
      return readEnv("WHATSAPP_APP_SECRET");
    },
  },
  ai: {
    get apiKey() {
      return readEnv("AI_API_KEY");
    },
    get baseUrl() {
      return readEnv("AI_BASE_URL") || "https://api.openai.com/v1";
    },
    get model() {
      return readEnv("AI_MODEL") || "gpt-4o-mini";
    },
  },
  ops: {
    get email() {
      return (readEnv("OPS_EMAIL") || "david@zentra.local").toLowerCase();
    },
    get password() {
      return readEnv("OPS_PASSWORD") || readEnv("WHATSAPP_VERIFY_TOKEN");
    },
    get notifyPhone() {
      return readEnv("OPS_NOTIFY_PHONE");
    },
  },
  get cronSecret() {
    return readEnv("CRON_SECRET");
  },
};

export function opsPasswordReady() {
  return opsConfig.ops.password.length >= 8;
}
