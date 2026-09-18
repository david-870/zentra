import { runtimeEnv } from "@/lib/ops/runtime-env";

export const opsConfig = {
  get appUrl() {
    return runtimeEnv("APP_URL") || "http://localhost:3000";
  },
  get webhookUrl() {
    return runtimeEnv("WEBHOOK_URL") || "http://localhost:3000/api/whatsapp/webhook";
  },
  whatsapp: {
    get accessToken() {
      return runtimeEnv("WHATSAPP_ACCESS_TOKEN");
    },
    get phoneNumberId() {
      return runtimeEnv("WHATSAPP_PHONE_NUMBER_ID");
    },
    get businessAccountId() {
      return runtimeEnv("WHATSAPP_BUSINESS_ACCOUNT_ID");
    },
    get verifyToken() {
      return runtimeEnv("WHATSAPP_VERIFY_TOKEN");
    },
    get appSecret() {
      return runtimeEnv("WHATSAPP_APP_SECRET");
    },
  },
  ai: {
    get apiKey() {
      return runtimeEnv("AI_API_KEY");
    },
    get baseUrl() {
      return runtimeEnv("AI_BASE_URL") || "https://api.openai.com/v1";
    },
    get model() {
      return runtimeEnv("AI_MODEL") || "gpt-4o-mini";
    },
  },
  ops: {
    get email() {
      return (runtimeEnv("OPS_EMAIL") || "david@zentra.local").toLowerCase();
    },
    get password() {
      return runtimeEnv("OPS_PASSWORD");
    },
    get notifyPhone() {
      return runtimeEnv("OPS_NOTIFY_PHONE");
    },
  },
  get cronSecret() {
    return runtimeEnv("CRON_SECRET");
  },
};

export function opsPasswordReady() {
  return opsConfig.ops.password.length >= 8;
}
