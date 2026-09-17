import { LeadStatus, type Conversation, type Lead } from "@prisma/client";
import { completeChat } from "@/lib/ops/ai";
import { db } from "@/lib/ops/db";
import { knowledgeBlock } from "@/lib/ops/knowledge";
import { notify } from "@/lib/ops/notify";
import {
  extraQuestion,
  detectBudget,
  detectNeed,
  LeadContext,
  recommendPackage,
  recommendationCopy,
  scoreLead,
  wantsHandoff,
  WELCOME,
} from "@/lib/ops/qualify";
import { sendWhatsAppList, sendWhatsAppText, whatsappConfigured, normalizeWaPhone } from "@/lib/ops/whatsapp";

function readContext(raw: string): LeadContext {
  try {
    return JSON.parse(raw) as LeadContext;
  } catch {
    return {};
  }
}

async function reply(conversationId: string, to: string, text: string) {
  const sent = await sendWhatsAppText(to, text);
  await db.message.create({
    data: {
      conversationId,
      waMessageId: sent.id,
      direction: "OUT",
      author: "AI",
      text,
    },
  });
}

async function saveContext(conversationId: string, ctx: LeadContext, stage: string) {
  await db.conversation.update({
    where: { id: conversationId },
    data: { contextJson: JSON.stringify(ctx), stage },
  });
}

async function upsertLead(contactId: string, conversationId: string, phone: string, ctx: LeadContext, status: LeadStatus) {
  const existing = await db.lead.findUnique({ where: { conversationId } });
  const score = scoreLead(ctx, true);
  const data = {
    name: ctx.name,
    phone,
    businessName: ctx.businessName,
    businessDescription: ctx.businessDescription,
    problem: ctx.problem,
    serviceInterest: ctx.serviceInterest,
    packageInterest: ctx.packageInterest,
    budgetRange: ctx.budgetRange,
    source: ctx.source ?? "whatsapp",
    score,
    status,
  };

  if (existing) {
    return db.lead.update({ where: { id: existing.id }, data });
  }

  return db.lead.create({
    data: {
      ...data,
      contactId,
      conversationId,
    },
  });
}

async function scheduleFollowUps(leadId: string, name: string) {
  const existing = await db.followUp.count({ where: { leadId } });
  if (existing > 0) return;
  const now = Date.now();
  const templates = [
    { days: 1, text: `Hi ${name}, just checking in about the project we discussed. Do you have any questions I can help with?` },
    { days: 3, text: `Hi ${name}, would you like us to put together a simple direction for how we'd approach your project?` },
    { days: 7, text: `Hi ${name}, just checking in one last time. If you're still exploring the project, we're happy to help.` },
  ];
  await db.followUp.createMany({
    data: templates.map((item) => ({
      leadId,
      offsetDays: item.days,
      template: item.text,
      scheduledAt: new Date(now + item.days * 24 * 60 * 60 * 1000),
    })),
  });
}

async function handoff(conversation: Conversation, lead: Lead | null, to: string, reason: string) {
  await db.conversation.update({
    where: { id: conversation.id },
    data: { control: "HUMAN", stage: "handoff", handoffAt: new Date() },
  });
  if (lead) {
    await db.lead.update({
      where: { id: lead.id },
      data: { status: "HUMAN_HANDOFF" },
    });
  }
  await notify({
    type: "handoff",
    title: "Customer requested human assistance",
    body: reason,
    leadId: lead?.id,
  });
  await reply(
    conversation.id,
    to,
    "I don't want to guess here. I'll connect you with someone from the Zentra team — they'll continue on this chat.",
  );
}

export async function processCustomerText(input: {
  waId: string;
  phone: string;
  profileName?: string;
  waMessageId: string;
  text: string;
}) {
  const phone = normalizeWaPhone(input.phone);
  const waId = normalizeWaPhone(input.waId);

  const duplicate = await db.message.findUnique({ where: { waMessageId: input.waMessageId } });
  if (duplicate) return { duplicate: true };

  const contact = await db.contact.upsert({
    where: { waId },
    update: { name: input.profileName ?? undefined, phone },
    create: { waId, phone, name: input.profileName },
  });

  let conversation = await db.conversation.findFirst({
    where: { contactId: contact.id },
    orderBy: { createdAt: "desc" },
  });
  if (!conversation) {
    conversation = await db.conversation.create({ data: { contactId: contact.id } });
  }

  await db.message.create({
    data: {
      conversationId: conversation.id,
      waMessageId: input.waMessageId,
      direction: "IN",
      author: "CUSTOMER",
      text: input.text,
    },
  });

  const ctx = readContext(conversation.contextJson);
  if (!ctx.source) ctx.source = "whatsapp";
  if (input.profileName && !ctx.name) ctx.name = input.profileName;

  const lead = await upsertLead(
    contact.id,
    conversation.id,
    phone,
    ctx,
    conversation.control === "HUMAN" ? "HUMAN_HANDOFF" : conversation.stage === "welcome" ? "NEW" : "QUALIFYING",
  );

  if (conversation.control === "HUMAN") {
    await notify({
      type: "message",
      title: "New message while human is active",
      body: input.text.slice(0, 140),
      leadId: lead.id,
    });
    return { queued: true };
  }

  try {
    return await runStage(conversation, contact.id, phone, input.text, ctx);
  } catch (error) {
    console.error(error);
    await db.conversation.update({
      where: { id: conversation.id },
      data: { control: "HUMAN", stage: "handoff", handoffAt: new Date() },
    });
    await db.lead.update({
      where: { id: lead.id },
      data: { status: "HUMAN_HANDOFF" },
    });
    await notify({
      type: "error",
      title: "AI failed — needs human attention",
      body: error instanceof Error ? error.message.slice(0, 280) : "Unknown error",
      leadId: lead.id,
    });
    return { failed: true };
  }
}

async function runStage(
  conversation: Conversation,
  contactId: string,
  phone: string,
  text: string,
  ctx: LeadContext,
) {
  if (wantsHandoff(text) || ctx.serviceInterest === "human") {
    const lead = await upsertLead(contactId, conversation.id, phone, ctx, "HUMAN_HANDOFF");
    await handoff(conversation, lead, phone, text);
    return { handoff: true };
  }

  const stop = /stop follow|unsubscribe|stop messages/.test(text.toLowerCase());
  if (stop) {
    const lead = await db.lead.findUnique({ where: { conversationId: conversation.id } });
    if (lead) {
      await db.followUp.updateMany({ where: { leadId: lead.id, sentAt: null }, data: { cancelled: true } });
    }
    await reply(conversation.id, phone, "Understood — I won't send automated follow-ups.");
    return { stopped: true };
  }

  let stage = conversation.stage;
  const need = detectNeed(text);
  if (need?.packageInterest && !ctx.packageInterest) {
    Object.assign(ctx, need);
    if (ctx.source === "website") {
      stage = "name";
      await saveContext(conversation.id, ctx, stage);
      await reply(
        conversation.id,
        phone,
        `Thanks for looking at ${ctx.packageInterest}. I'll ask a few short questions so the team has context.\n\nWhat's your name?`,
      );
      await upsertLead(contactId, conversation.id, phone, ctx, "QUALIFYING");
      return { stage };
    }
  }

  if (stage === "welcome") {
    const detected = detectNeed(text);
    if (detected?.serviceInterest === "human") {
      const lead = await upsertLead(contactId, conversation.id, phone, ctx, "HUMAN_HANDOFF");
      await handoff(conversation, lead, phone, text);
      return { handoff: true };
    }
    if (detected?.serviceInterest && detected.serviceInterest !== "packages") {
      Object.assign(ctx, detected);
      await saveContext(conversation.id, ctx, "name");
      await upsertLead(contactId, conversation.id, phone, ctx, "QUALIFYING");
      await reply(conversation.id, phone, "What's your name?");
      return { stage: "name" };
    }
    await reply(conversation.id, phone, WELCOME);
    if (whatsappConfigured()) {
      await sendWhatsAppList(phone, "Choose an option, or just tell me what you need.", "Choose", [
        { id: "website", title: "Website / Web App" },
        { id: "automation", title: "AI & Automation" },
        { id: "crm", title: "CRM / Customers" },
        { id: "software", title: "Custom Software" },
        { id: "marketing", title: "Marketing & Growth" },
        { id: "packages", title: "View packages" },
        { id: "human", title: "Talk to a human" },
      ]);
    }
    await saveContext(conversation.id, ctx, "need");
    await upsertLead(contactId, conversation.id, phone, ctx, "NEW");
    return { stage: "need" };
  }

  if (stage === "need") {
    const detected = detectNeed(text);
    if (detected?.serviceInterest === "human") {
      const lead = await upsertLead(contactId, conversation.id, phone, ctx, "HUMAN_HANDOFF");
      await handoff(conversation, lead, phone, text);
      return { handoff: true };
    }
    if (detected?.serviceInterest === "packages") {
      await reply(
        conversation.id,
        phone,
        "Starter — from ₦250,000 — foundation website and WhatsApp.\nGrowth — from ₦650,000 — website, AI, CRM and automation.\nScale — from ₦1,500,000 — custom systems for established businesses.\n\nWhich of those is closest, or tell me the problem you're solving.",
      );
      return { stage };
    }
    if (!detected?.serviceInterest && !detected?.packageInterest) {
      await reply(conversation.id, phone, "Got it. Is this mainly a website, automation, CRM, custom software, or marketing?");
      return { stage };
    }
    Object.assign(ctx, detected);
    stage = "name";
    await saveContext(conversation.id, ctx, stage);
    await upsertLead(contactId, conversation.id, phone, ctx, "QUALIFYING");
    await reply(conversation.id, phone, "What's your name?");
    return { stage };
  }

  if (stage === "name") {
    ctx.name = text.replace(/^i('m| am)\s+/i, "").trim();
    stage = "business";
    await saveContext(conversation.id, ctx, stage);
    await upsertLead(contactId, conversation.id, phone, ctx, "QUALIFYING");
    await reply(conversation.id, phone, `Nice to meet you, ${ctx.name}. What's your business called?`);
    return { stage };
  }

  if (stage === "business") {
    ctx.businessName = text.trim();
    stage = "does";
    await saveContext(conversation.id, ctx, stage);
    await upsertLead(contactId, conversation.id, phone, ctx, "QUALIFYING");
    await reply(conversation.id, phone, "What does your business do?");
    return { stage };
  }

  if (stage === "does") {
    ctx.businessDescription = text.trim();
    stage = "problem";
    await saveContext(conversation.id, ctx, stage);
    await upsertLead(contactId, conversation.id, phone, ctx, "QUALIFYING");
    await reply(conversation.id, phone, "What's the biggest problem you're trying to solve right now?");
    return { stage };
  }

  if (stage === "problem") {
    ctx.problem = text.trim();
    stage = "context";
    await saveContext(conversation.id, ctx, stage);
    await upsertLead(contactId, conversation.id, phone, ctx, "QUALIFYING");
    await reply(conversation.id, phone, extraQuestion(ctx.serviceInterest));
    return { stage };
  }

  if (stage === "context") {
    ctx.extraQuestion = text.trim();
    stage = "budget";
    await saveContext(conversation.id, ctx, stage);
    await reply(
      conversation.id,
      phone,
      "Do you already have a budget range in mind for the project?\n\n1. ₦100k–₦300k\n2. ₦300k–₦700k\n3. ₦700k–₦1.5m\n4. ₦1.5m+\n5. Not sure yet",
    );
    return { stage };
  }

  if (stage === "budget") {
    ctx.budgetRange = detectBudget(text);
    ctx.packageInterest = recommendPackage(ctx);
    stage = "recommend";
    await saveContext(conversation.id, ctx, stage);
    const lead = await upsertLead(contactId, conversation.id, phone, ctx, "QUALIFIED");
    await scheduleFollowUps(lead.id, ctx.name ?? "there");
    await notify({
      type: "qualified",
      title: "New qualified lead",
      body: `${ctx.name ?? "Lead"} · ${ctx.businessName ?? "Business"} · ${ctx.packageInterest}`,
      leadId: lead.id,
    });
    if (lead.score >= 61) {
      await notify({
        type: "priority",
        title: "High-priority lead",
        body: `${ctx.name ?? "Lead"} scored ${lead.score}`,
        leadId: lead.id,
      });
    }
    await reply(
      conversation.id,
      phone,
      `${recommendationCopy(ctx.packageInterest)}\n\nWould you like to:\n\n1. Start a project\n2. Speak with the Zentra team\n3. See what's included`,
    );
    return { stage };
  }

  if (stage === "recommend") {
    const value = text.toLowerCase();
    if (/2|speak|human|team/.test(value)) {
      const lead = await upsertLead(contactId, conversation.id, phone, ctx, "HUMAN_HANDOFF");
      await handoff(conversation, lead, phone, text);
      return { handoff: true };
    }
    if (/3|included|what's in/.test(value)) {
      const pack = await db.package.findUnique({ where: { id: ctx.packageInterest ?? "growth" } });
      await reply(
        conversation.id,
        phone,
        pack ? `${pack.name} includes:\n${pack.features.split("; ").map((item) => `• ${item}`).join("\n")}` : "I can connect you with the team for the full breakdown.",
      );
      return { stage };
    }
    await db.lead.updateMany({
      where: { conversationId: conversation.id },
      data: { status: "PROPOSAL" },
    });
    await saveContext(conversation.id, ctx, "complete");
    await reply(
      conversation.id,
      phone,
      "Great. A person from the Zentra team will continue from here and confirm the right next step.",
    );
    const lead = await db.lead.findUnique({ where: { conversationId: conversation.id } });
    await db.conversation.update({
      where: { id: conversation.id },
      data: { control: "HUMAN", stage: "complete", handoffAt: new Date() },
    });
    await notify({
      type: "proposal",
      title: "Lead ready to start a project",
      body: ctx.name ?? "Lead",
      leadId: lead?.id,
    });
    return { complete: true };
  }

  const kb = await knowledgeBlock();
  try {
    const generated = await completeChat([
      { role: "system", content: kb },
      { role: "user", content: text },
    ]);
    if (generated) {
      await reply(conversation.id, phone, generated);
      return { llm: true };
    }
  } catch {
    const lead = await db.lead.findUnique({ where: { conversationId: conversation.id } });
    await handoff(conversation, lead, phone, "AI provider failed");
    return { handoff: true };
  }

  await reply(
    conversation.id,
    phone,
    "I don't have that information available right now. I can connect you with someone from the Zentra team.",
  );
  return { unknown: true };
}
