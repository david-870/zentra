import { completeChat } from "@/lib/ops/ai";
import {
  addMessage,
  cancelFollowUps,
  getLeadByConversation,
  getOrCreateConversation,
  messageExists,
  PACKAGE_FEATURES,
  saveConversation,
  scheduleFollowUps,
  upsertContact,
  upsertLead,
  type ChatConversation,
} from "@/lib/ops/chat-store";
import { notifyOwner } from "@/lib/ops/owner-notify";
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
  await addMessage(conversationId, {
    waMessageId: sent.id,
    direction: "OUT",
    author: "AI",
    text,
  });
}

async function saveContext(conversationId: string, ctx: LeadContext, stage: string) {
  await saveConversation(conversationId, { contextJson: JSON.stringify(ctx), stage });
}

async function writeLead(
  contactId: string,
  conversationId: string,
  phone: string,
  ctx: LeadContext,
  status: string,
) {
  return upsertLead(contactId, conversationId, phone, {
    name: ctx.name,
    businessName: ctx.businessName,
    businessDescription: ctx.businessDescription,
    problem: ctx.problem,
    serviceInterest: ctx.serviceInterest,
    packageInterest: ctx.packageInterest,
    budgetRange: ctx.budgetRange,
    source: ctx.source ?? "whatsapp",
    score: scoreLead(ctx, true),
    status,
  });
}

async function handoff(conversation: ChatConversation, lead: { id: string; score: number } | null, to: string, reason: string) {
  await saveConversation(conversation.id, { control: "HUMAN", stage: "handoff", handoff: true });
  if (lead) {
    await upsertLead(conversation.contactId, conversation.id, to, {
      score: lead.score,
      status: "HUMAN_HANDOFF",
    });
  }
  await notifyOwner(
    "ZENTRA WHATSAPP — HUMAN NEEDED",
    [`Someone asked to talk to a person.`, `Phone: ${to}`, `Reason: ${reason.slice(0, 280)}`].join("\n"),
  );
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

  if (await messageExists(input.waMessageId)) return { duplicate: true };

  const contactId = await upsertContact(waId, phone, input.profileName);
  const conversation = await getOrCreateConversation(contactId);

  await addMessage(conversation.id, {
    waMessageId: input.waMessageId,
    direction: "IN",
    author: "CUSTOMER",
    text: input.text,
  });

  const ctx = readContext(conversation.contextJson);
  if (!ctx.source) ctx.source = "whatsapp";
  if (input.profileName && !ctx.name) ctx.name = input.profileName;

  const lead = await writeLead(
    contactId,
    conversation.id,
    phone,
    ctx,
    conversation.control === "HUMAN" ? "HUMAN_HANDOFF" : conversation.stage === "welcome" ? "NEW" : "QUALIFYING",
  );

  if (conversation.control === "HUMAN") {
    await notifyOwner(
      "ZENTRA WHATSAPP — NEW MESSAGE",
      [`Phone: ${phone}`, `Message: ${input.text.slice(0, 280)}`].join("\n"),
    );
    return { queued: true };
  }

  try {
    return await runStage(conversation, contactId, phone, input.text, ctx);
  } catch (error) {
    console.error(error);
    await saveConversation(conversation.id, { control: "HUMAN", stage: "handoff", handoff: true });
    await writeLead(contactId, conversation.id, phone, ctx, "HUMAN_HANDOFF");
    await notifyOwner(
      "ZENTRA WHATSAPP — NEEDS YOU",
      [`The assistant could not finish this chat.`, `Phone: ${phone}`].join("\n"),
    );
    return { failed: true };
  }
}

async function runStage(
  conversation: ChatConversation,
  contactId: string,
  phone: string,
  text: string,
  ctx: LeadContext,
) {
  if (wantsHandoff(text) || ctx.serviceInterest === "human") {
    const lead = await writeLead(contactId, conversation.id, phone, ctx, "HUMAN_HANDOFF");
    await handoff(conversation, lead, phone, text);
    return { handoff: true };
  }

  if (/stop follow|unsubscribe|stop messages/.test(text.toLowerCase())) {
    const lead = await getLeadByConversation(conversation.id);
    if (lead) await cancelFollowUps(lead.id);
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
      await writeLead(contactId, conversation.id, phone, ctx, "QUALIFYING");
      return { stage };
    }
  }

  if (stage === "welcome") {
    const detected = detectNeed(text);
    if (detected?.serviceInterest === "human") {
      const lead = await writeLead(contactId, conversation.id, phone, ctx, "HUMAN_HANDOFF");
      await handoff(conversation, lead, phone, text);
      return { handoff: true };
    }
    if (detected?.serviceInterest && detected.serviceInterest !== "packages") {
      Object.assign(ctx, detected);
      await saveContext(conversation.id, ctx, "name");
      await writeLead(contactId, conversation.id, phone, ctx, "QUALIFYING");
      await reply(conversation.id, phone, "What's your name?");
      return { stage: "name" };
    }
    await reply(conversation.id, phone, WELCOME);
    if (whatsappConfigured()) {
      try {
        await sendWhatsAppList(phone, "Choose an option, or just tell me what you need.", "Choose", [
          { id: "website", title: "Website / Web App" },
          { id: "automation", title: "AI & Automation" },
          { id: "crm", title: "CRM / Customers" },
          { id: "software", title: "Custom Software" },
          { id: "marketing", title: "Marketing" },
          { id: "packages", title: "View packages" },
          { id: "human", title: "Talk to a human" },
        ]);
      } catch (error) {
        console.error(error);
      }
    }
    await saveContext(conversation.id, ctx, "need");
    await writeLead(contactId, conversation.id, phone, ctx, "NEW");
    return { stage: "need" };
  }

  if (stage === "need") {
    const detected = detectNeed(text);
    if (detected?.serviceInterest === "human") {
      const lead = await writeLead(contactId, conversation.id, phone, ctx, "HUMAN_HANDOFF");
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
    await writeLead(contactId, conversation.id, phone, ctx, "QUALIFYING");
    await reply(conversation.id, phone, "What's your name?");
    return { stage };
  }

  if (stage === "name") {
    ctx.name = text.replace(/^i('m| am)\s+/i, "").trim();
    stage = "business";
    await saveContext(conversation.id, ctx, stage);
    await writeLead(contactId, conversation.id, phone, ctx, "QUALIFYING");
    await reply(conversation.id, phone, `Nice to meet you, ${ctx.name}. What's your business called?`);
    return { stage };
  }

  if (stage === "business") {
    ctx.businessName = text.trim();
    stage = "does";
    await saveContext(conversation.id, ctx, stage);
    await writeLead(contactId, conversation.id, phone, ctx, "QUALIFYING");
    await reply(conversation.id, phone, "What does your business do?");
    return { stage };
  }

  if (stage === "does") {
    ctx.businessDescription = text.trim();
    stage = "problem";
    await saveContext(conversation.id, ctx, stage);
    await writeLead(contactId, conversation.id, phone, ctx, "QUALIFYING");
    await reply(conversation.id, phone, "What's the biggest problem you're trying to solve right now?");
    return { stage };
  }

  if (stage === "problem") {
    ctx.problem = text.trim();
    stage = "context";
    await saveContext(conversation.id, ctx, stage);
    await writeLead(contactId, conversation.id, phone, ctx, "QUALIFYING");
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
    const lead = await writeLead(contactId, conversation.id, phone, ctx, "QUALIFIED");
    await scheduleFollowUps(lead.id, ctx.name ?? "there");
    await notifyOwner(
      "ZENTRA WHATSAPP — QUALIFIED LEAD",
      [
        `Name: ${ctx.name ?? "—"}`,
        `Business: ${ctx.businessName ?? "—"}`,
        `Need: ${ctx.problem ?? "—"}`,
        `Package: ${ctx.packageInterest}`,
        `Budget: ${ctx.budgetRange ?? "—"}`,
        `Phone: ${phone}`,
      ].join("\n"),
    );
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
      const lead = await writeLead(contactId, conversation.id, phone, ctx, "HUMAN_HANDOFF");
      await handoff(conversation, lead, phone, text);
      return { handoff: true };
    }
    if (/3|included|what's in/.test(value)) {
      const features = PACKAGE_FEATURES[ctx.packageInterest ?? "growth"] ?? PACKAGE_FEATURES.growth;
      await reply(
        conversation.id,
        phone,
        `${ctx.packageInterest ?? "Growth"} includes:\n${features.split("; ").map((item) => `• ${item}`).join("\n")}`,
      );
      return { stage };
    }
    await writeLead(contactId, conversation.id, phone, ctx, "PROPOSAL");
    await saveConversation(conversation.id, {
      contextJson: JSON.stringify(ctx),
      stage: "complete",
      control: "HUMAN",
      handoff: true,
    });
    await reply(
      conversation.id,
      phone,
      "Great. A person from the Zentra team will continue from here and confirm the right next step.",
    );
    await notifyOwner(
      "ZENTRA WHATSAPP — READY TO START",
      [`Name: ${ctx.name ?? "—"}`, `Business: ${ctx.businessName ?? "—"}`, `Phone: ${phone}`].join("\n"),
    );
    return { complete: true };
  }

  try {
    const generated = await completeChat([
      {
        role: "system",
        content:
          "You are Zentra's WhatsApp assistant. Short messages. Never invent prices, timelines, discounts, clients or results. If unsure, offer to connect a human. Packages: Starter ₦250,000, Growth ₦650,000, Scale from ₦1,500,000.",
      },
      { role: "user", content: text },
    ]);
    if (generated) {
      await reply(conversation.id, phone, generated);
      return { llm: true };
    }
  } catch {
    const lead = await getLeadByConversation(conversation.id);
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
