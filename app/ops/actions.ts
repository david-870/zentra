"use server";

import { LeadStatus, ConversationControl } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, destroySession, requireUser, verifyPassword } from "@/lib/ops/auth";
import { db } from "@/lib/ops/db";
import { runDueFollowUps } from "@/lib/ops/followups";
import { notify } from "@/lib/ops/notify";
import { sendWhatsAppText } from "@/lib/ops/whatsapp";
import { processCustomerText } from "@/lib/ops/engine";
import { ensureSeed } from "@/lib/ops/seed";

function refreshOps(leadId?: string) {
  revalidatePath("/ops");
  revalidatePath("/ops/leads");
  revalidatePath("/ops/analytics");
  revalidatePath("/ops/knowledge");
  if (leadId) revalidatePath(`/ops/leads/${leadId}`);
}

export async function loginAction(formData: FormData) {
  await ensureSeed();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    redirect("/ops/login?error=1");
  }
  await createSession(user.id);
  redirect("/ops");
}

export async function logoutAction() {
  await destroySession();
  redirect("/ops/login");
}

export async function updateLeadStatus(leadId: string, formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/ops/login");
  const status = String(formData.get("status") ?? "") as LeadStatus;
  if (!status) return;
  await db.lead.update({ where: { id: leadId }, data: { status } });
  refreshOps(leadId);
}

export async function setConversationControl(conversationId: string, control: ConversationControl) {
  const user = await requireUser();
  if (!user) redirect("/ops/login");
  await db.conversation.update({
    where: { id: conversationId },
    data: {
      control,
      handoffAt: control === "HUMAN" ? new Date() : null,
    },
  });
  if (control === "HUMAN") {
    await db.lead.updateMany({
      where: { conversationId },
      data: { status: "HUMAN_HANDOFF" },
    });
  }
  const lead = await db.lead.findUnique({ where: { conversationId } });
  refreshOps(lead?.id);
}

export async function addNote(leadId: string, formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/ops/login");
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;
  await db.note.create({ data: { leadId, userId: user.id, text } });
  refreshOps(leadId);
}

export async function sendHumanMessage(conversationId: string, formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/ops/login");
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: { contact: true },
  });
  if (!conversation) return;

  if (conversation.control !== "HUMAN") {
    await db.conversation.update({
      where: { id: conversationId },
      data: { control: "HUMAN", handoffAt: new Date() },
    });
  }

  try {
    const sent = await sendWhatsAppText(conversation.contact.phone, text);
    await db.message.create({
      data: {
        conversationId,
        waMessageId: sent.id,
        direction: "OUT",
        author: "HUMAN",
        userId: user.id,
        text,
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "WhatsApp send failed";
    const failedLead = await db.lead.findUnique({ where: { conversationId } });
    await notify({
      type: "error",
      title: "WhatsApp send failed",
      body: detail.slice(0, 280),
      leadId: failedLead?.id,
    });
    if (failedLead) redirect(`/ops/leads/${failedLead.id}?send=error`);
    return;
  }
  const lead = await db.lead.findUnique({ where: { conversationId } });
  refreshOps(lead?.id);
}

export async function scheduleFollowUp(leadId: string, formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/ops/login");
  const days = Number(formData.get("days") ?? 1);
  const template = String(formData.get("template") ?? "").trim();
  if (!template) return;
  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead) return;
  await db.followUp.create({
    data: {
      leadId,
      offsetDays: days,
      template,
      scheduledAt: new Date(Date.now() + Math.max(1, days) * 24 * 60 * 60 * 1000),
    },
  });
  await notify({ type: "followup", title: "Follow-up scheduled", body: template.slice(0, 140), leadId });
  refreshOps(leadId);
}

export async function runFollowUpsAction() {
  const user = await requireUser();
  if (!user) redirect("/ops/login");
  await runDueFollowUps();
  refreshOps();
}

export async function simulateInbound(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/ops/login");
  const phone = String(formData.get("phone") ?? "").replace(/\D/g, "");
  const text = String(formData.get("text") ?? "").trim();
  if (!phone || !text) return;
  await ensureSeed();
  await processCustomerText({
    waId: phone,
    phone,
    profileName: String(formData.get("name") ?? "") || undefined,
    waMessageId: `sim-${Date.now()}`,
    text,
  });
  refreshOps();
}

export async function markNotificationsRead() {
  const user = await requireUser();
  if (!user) redirect("/ops/login");
  await db.notification.updateMany({ where: { read: false }, data: { read: true } });
  refreshOps();
}

export async function updateKnowledge(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/ops/login");
  const id = String(formData.get("id") ?? "");
  const body = String(formData.get("body") ?? "");
  if (!id) return;
  await db.knowledgeBaseItem.update({ where: { id }, data: { body } });
  refreshOps();
}
