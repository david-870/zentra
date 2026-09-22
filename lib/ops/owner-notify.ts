import { sendOpsEmail } from "@/lib/ops/email";
import { sendOwnerPing } from "@/lib/ops/whatsapp";

export async function notifyOwner(title: string, body: string, excludePhone?: string) {
  try {
    await sendOpsEmail(title, body);
  } catch (error) {
    console.error(error);
  }

  try {
    await sendOwnerPing(`${title}\n${body}`.slice(0, 3500), excludePhone);
  } catch (error) {
    console.error(error);
  }
}
