import { sendOpsEmail } from "@/lib/ops/email";

export async function notifyOwner(title: string, body: string, _excludePhone?: string) {
  try {
    await sendOpsEmail(title, body);
  } catch (error) {
    console.error(error);
  }
}
