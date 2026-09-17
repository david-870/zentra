import { db } from "@/lib/ops/db";
import { notify } from "@/lib/ops/notify";
import { sendWhatsAppText } from "@/lib/ops/whatsapp";

export async function runDueFollowUps() {
  const due = await db.followUp.findMany({
    where: {
      cancelled: false,
      sentAt: null,
      scheduledAt: { lte: new Date() },
      lead: { status: { in: ["QUALIFIED", "FOLLOW_UP", "PROPOSAL"] } },
    },
    include: { lead: true },
    take: 20,
  });

  let sent = 0;
  for (const item of due) {
    const conversation = item.lead.conversationId
      ? await db.conversation.findUnique({ where: { id: item.lead.conversationId } })
      : null;
    if (!conversation || conversation.control === "HUMAN") continue;

    await sendWhatsAppText(item.lead.phone, item.template);
    if (conversation) {
      await db.message.create({
        data: {
          conversationId: conversation.id,
          direction: "OUT",
          author: "AI",
          text: item.template,
        },
      });
    }
    await db.followUp.update({ where: { id: item.id }, data: { sentAt: new Date() } });
    await db.lead.update({ where: { id: item.leadId }, data: { status: "FOLLOW_UP" } });
    await notify({
      type: "followup",
      title: "Follow-up due",
      body: item.template.slice(0, 140),
      leadId: item.leadId,
    });
    sent += 1;
  }
  return sent;
}
