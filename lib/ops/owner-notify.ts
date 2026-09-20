import { opsConfig } from "@/lib/ops/config";
import { sendOpsEmail } from "@/lib/ops/email";
import { normalizeWaPhone, sendWhatsAppText } from "@/lib/ops/whatsapp";

export async function notifyOwner(title: string, body: string) {
  try {
    await sendOpsEmail(title, body);
  } catch (error) {
    console.error(error);
  }

  const to = normalizeWaPhone(opsConfig.ops.notifyPhone);
  if (!to) return;
  try {
    await sendWhatsAppText(to, body.slice(0, 3500));
  } catch (error) {
    console.error(error);
  }
}
