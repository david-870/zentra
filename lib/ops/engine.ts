import { completeChat } from "@/lib/ops/ai";
import {
  answerClient,
  isConversational,
  isNumberedChoice,
  looksLikePersonName,
  SYSTEM_PROMPT,
} from "@/lib/ops/assistant";
import {
  addMessage,
  cancelFollowUps,
  getLeadByConversation,
  getOrCreateConversation,
  listRecentMessages,
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
  firstName,
  isGreeting,
  LeadContext,
  packageLabel,
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
    "Of course. I'll get someone from the team on this chat now — they'll pick it up from here.",
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

  if (isGreeting(input.text)) {
    await saveConversation(conversation.id, { control: "AI", stage: "welcome" });
    conversation.control = "AI";
    conversation.stage = "welcome";
  }

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
    await reply(conversation.id, phone, "Got it — I won't send any more follow-ups.");
    return { stopped: true };
  }

  if (isConversational(text) && !isNumberedChoice(text)) {
    const history = await listRecentMessages(conversation.id);
    const answer = await answerClient({
      text,
      stage: conversation.stage,
      ctx,
      history: history.slice(0, -1),
    });
    if (answer.handoff) {
      const lead = await writeLead(contactId, conversation.id, phone, ctx, "HUMAN_HANDOFF");
      await handoff(conversation, lead, phone, text);
      return { handoff: true };
    }
    if (answer.text) {
      await reply(conversation.id, phone, answer.text);
      if (conversation.stage === "welcome") {
        await saveContext(conversation.id, ctx, "need");
      }
      return { chat: true };
    }
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
        `Thanks for taking a look at ${packageLabel(ctx.packageInterest)}. I'll ask a few quick questions so we point you the right way.\n\nWhat should I call you?`,
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
      await reply(conversation.id, phone, "Great — I can help with that. What should I call you?");
      return { stage: "name" };
    }
    await reply(conversation.id, phone, WELCOME);
    if (whatsappConfigured()) {
      try {
        await sendWhatsAppList(phone, "Tap one, or just type it in your own words.", "Choose", [
          { id: "website", title: "Website / Web App" },
          { id: "automation", title: "AI & Automation" },
          { id: "crm", title: "CRM / Customers" },
          { id: "software", title: "Custom Software" },
          { id: "marketing", title: "Marketing" },
          { id: "packages", title: "See packages" },
          { id: "human", title: "Talk to someone" },
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
        "Here's a simple way to think about it:\n\n*Starter* — from ₦250,000 — a proper website and WhatsApp.\n*Growth* — from ₦650,000 — website, enquiries, CRM and less manual work.\n*Scale* — from ₦1,500,000 — custom systems for how you already work.\n\nWhich feels closest? Or just tell me the problem you're trying to fix.",
      );
      return { stage };
    }
    if (!detected?.serviceInterest && !detected?.packageInterest) {
      const history = await listRecentMessages(conversation.id);
      const answer = await answerClient({
        text,
        stage: "need",
        ctx,
        history: history.slice(0, -1),
      });
      await reply(
        conversation.id,
        phone,
        answer.text ||
          "No worries. Tell me what you need in your own words — a website, automation, a customer system, or something else.",
      );
      return { stage };
    }
    Object.assign(ctx, detected);
    stage = "name";
    await saveContext(conversation.id, ctx, stage);
    await writeLead(contactId, conversation.id, phone, ctx, "QUALIFYING");
    await reply(conversation.id, phone, "Lovely. What should I call you?");
    return { stage };
  }

  if (stage === "name") {
    if (!looksLikePersonName(text)) {
      const history = await listRecentMessages(conversation.id);
      const answer = await answerClient({
        text,
        stage: "name",
        ctx,
        history: history.slice(0, -1),
      });
      await reply(
        conversation.id,
        phone,
        `${answer.text || "Happy to help."}\n\nWhat should I call you?`,
      );
      return { stage };
    }
    ctx.name = text.replace(/^(my name is|i am|i'm|i’m|call me)\s+/i, "").trim();
    stage = "business";
    await saveContext(conversation.id, ctx, stage);
    await writeLead(contactId, conversation.id, phone, ctx, "QUALIFYING");
    await reply(
      conversation.id,
      phone,
      firstName(ctx.name)
        ? `Nice to meet you, ${firstName(ctx.name)}. What's the business called?`
        : "What's the business called?",
    );
    return { stage };
  }

  if (stage === "business") {
    ctx.businessName = text.trim();
    stage = "does";
    await saveContext(conversation.id, ctx, stage);
    await writeLead(contactId, conversation.id, phone, ctx, "QUALIFYING");
    await reply(conversation.id, phone, "And what do you do there? A sentence is plenty.");
    return { stage };
  }

  if (stage === "does") {
    ctx.businessDescription = text.trim();
    stage = "problem";
    await saveContext(conversation.id, ctx, stage);
    await writeLead(contactId, conversation.id, phone, ctx, "QUALIFYING");
    await reply(conversation.id, phone, "What's slowing you down most right now?");
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
      "No stress if you're not sure yet — roughly, what range are you thinking?\n\n1. ₦100k–₦300k\n2. ₦300k–₦700k\n3. ₦700k–₦1.5m\n4. ₦1.5m+\n5. Not sure yet",
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
      `${recommendationCopy(ctx.packageInterest)}\n\nWhat would you like to do next?\n\n1. Start a project\n2. Talk to the team\n3. See what's included`,
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
        `${packageLabel(ctx.packageInterest) || "Growth"} includes:\n${features.split("; ").map((item) => `• ${item}`).join("\n")}\n\nWant to start a project, or talk it through with the team?`,
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
      "Lovely. Someone from the team will continue here and talk through the next step with you.",
    );
    await notifyOwner(
      "ZENTRA WHATSAPP — READY TO START",
      [`Name: ${ctx.name ?? "—"}`, `Business: ${ctx.businessName ?? "—"}`, `Phone: ${phone}`].join("\n"),
    );
    return { complete: true };
  }

  try {
    const history = await listRecentMessages(conversation.id);
    const generated = await completeChat([
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      ...history.slice(0, -1),
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
    "I'm not sure on that one. Want me to get someone from the team to jump in?",
  );
  return { unknown: true };
}
