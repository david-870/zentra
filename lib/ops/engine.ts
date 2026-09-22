import {
  answerClient,
  isConversational,
  isNumberedChoice,
  looksLikePersonName,
} from "@/lib/ops/assistant";
import {
  addMessage,
  cancelFollowUps,
  getLeadByConversation,
  getOrCreateConversation,
  listRecentMessages,
  PACKAGE_FEATURES,
  saveConversation,
  scheduleFollowUps,
  upsertContact,
  upsertLead,
  type ChatConversation,
} from "@/lib/ops/chat-store";
import { numberedService, topicFromText, lastAssistantText } from "@/lib/ops/intent";
import { notifyOwner } from "@/lib/ops/owner-notify";
import {
  extraQuestion,
  detectBudget,
  detectNeed,
  extractLeadHints,
  firstName,
  isGreeting,
  LeadContext,
  packageLabel,
  recommendPackage,
  recommendationCopy,
  scoreLead,
  wantsAdaResume,
  wantsHandoff,
  wantsRestart,
  WELCOME,
} from "@/lib/ops/qualify";
import { clipInbound, sanitizeCustomerReply } from "@/lib/ops/reply-guard";
import { sendWhatsAppText, normalizeWaPhone } from "@/lib/ops/whatsapp";

const FORM_STAGES = new Set(["name", "business", "does", "problem", "context", "budget", "recommend"]);

function readContext(raw: string): LeadContext {
  try {
    return JSON.parse(raw) as LeadContext;
  } catch {
    return {};
  }
}

async function reply(conversationId: string, to: string, text: string) {
  const body = sanitizeCustomerReply(text);
  const sent = await sendWhatsAppText(to, body);
  await addMessage(conversationId, {
    waMessageId: sent.id,
    direction: "OUT",
    author: "AI",
    text: body,
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
    to,
  );
  await reply(
    conversation.id,
    to,
    /\bcall me\b|\bphone (call|me)\b/i.test(reason)
      ? "Of course. I'll get someone from the team on this WhatsApp chat now — they'll pick it up from here. I don't have a confirmed phone-call process in my notes."
      : "Of course. I'll get someone from the team on this chat now — they'll pick it up from here.",
  );
}

async function maybeNotifyQualified(
  conversation: ChatConversation,
  contactId: string,
  phone: string,
  ctx: LeadContext,
) {
  const ready = Boolean(
    (ctx.name || ctx.businessName) && (ctx.problem || ctx.serviceInterest || ctx.businessDescription),
  );
  if (!ready || ctx.qualifiedNotified) return;
  ctx.qualifiedNotified = true;
  const lead = await writeLead(contactId, conversation.id, phone, ctx, "QUALIFIED");
  await scheduleFollowUps(lead.id, ctx.name ?? "there");
  await notifyOwner(
    "ZENTRA WHATSAPP — QUALIFIED LEAD",
    [
      `Name: ${ctx.name ?? "—"}`,
      `Business: ${ctx.businessName ?? ctx.businessDescription ?? "—"}`,
      `Need: ${ctx.problem ?? ctx.serviceInterest ?? "—"}`,
      `Package: ${ctx.packageInterest ?? "—"}`,
      `Phone: ${phone}`,
    ].join("\n"),
    phone,
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
  const text = clipInbound(input.text);

  const contactId = await upsertContact(waId, phone, input.profileName);
  const conversation = await getOrCreateConversation(contactId);

  await addMessage(conversation.id, {
    waMessageId: input.waMessageId,
    direction: "IN",
    author: "CUSTOMER",
    text,
  });

  const ctx = readContext(conversation.contextJson);
  if (!ctx.source) ctx.source = "whatsapp";
  if (input.profileName && !ctx.name && looksLikePersonName(input.profileName)) {
    ctx.name = input.profileName;
  }

  if (wantsAdaResume(text)) {
    const stage = isGreeting(text) || wantsRestart(text) ? "welcome" : "chat";
    await saveConversation(conversation.id, { control: "AI", stage });
    conversation.control = "AI";
    conversation.stage = stage;
  }

  if (conversation.control === "HUMAN") {
    await writeLead(contactId, conversation.id, phone, ctx, "HUMAN_HANDOFF");
    await notifyOwner(
      "ZENTRA WHATSAPP — NEW MESSAGE",
      [`Phone: ${phone}`, `Message: ${text.slice(0, 280)}`].join("\n"),
      phone,
    );
    return { queued: true };
  }

  try {
    return await runStage(conversation, contactId, phone, text, ctx);
  } catch (error) {
    console.error(error);
    await saveConversation(conversation.id, { control: "HUMAN", stage: "handoff", handoff: true });
    await writeLead(contactId, conversation.id, phone, ctx, "HUMAN_HANDOFF");
    await notifyOwner(
      "ZENTRA WHATSAPP — NEEDS YOU",
      [`The assistant could not finish this chat.`, `Phone: ${phone}`].join("\n"),
      phone,
    );
    return { failed: true };
  }
}

function mergeHints(ctx: LeadContext, text: string) {
  Object.assign(ctx, extractLeadHints(text, ctx));
  const picked = numberedService(text);
  if (picked && picked !== "human" && picked !== "packages") {
    ctx.serviceInterest = picked;
    ctx.lastTopic = picked;
  }
  const need = detectNeed(text);
  if (need?.serviceInterest && need.serviceInterest !== "human" && need.serviceInterest !== "packages") {
    if (!ctx.serviceInterest) ctx.serviceInterest = need.serviceInterest;
    ctx.lastTopic = need.serviceInterest;
  }
  if (need?.packageInterest && !ctx.packageInterest) ctx.packageInterest = need.packageInterest;
  const topic = topicFromText(text);
  if (topic) ctx.lastTopic = topic;
}

function looksLikeFormAnswer(stage: string, text: string, lastAssistant: string) {
  if (!FORM_STAGES.has(stage)) return false;
  if (isConversational(text) || text.includes("?")) return false;
  if (wantsHandoff(text)) return false;
  if (stage === "name") {
    if (!/call you|your name|nice to meet you/i.test(lastAssistant)) return false;
    return looksLikePersonName(text);
  }
  if (stage === "business" && !/business called/i.test(lastAssistant)) return false;
  if (stage === "does" && !/what do you do there/i.test(lastAssistant)) return false;
  if (stage === "problem" && !/slowing you down/i.test(lastAssistant)) return false;
  if (stage === "budget") return isNumberedChoice(text) && /^[1-5]\b/.test(text.trim());
  if (stage === "recommend") return /^[1-3]\b/.test(text.trim());
  return text.trim().split(/\s+/).length <= 12;
}

async function runStage(
  conversation: ChatConversation,
  contactId: string,
  phone: string,
  text: string,
  ctx: LeadContext,
) {
  if (wantsHandoff(text) || ctx.serviceInterest === "human" || numberedService(text) === "human") {
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

  mergeHints(ctx, text);

  if (isGreeting(text) || wantsRestart(text)) {
    const recent = await listRecentMessages(conversation.id, 4);
    const last = lastAssistantText(recent);
    if (!/1\. Website \/ web app/i.test(last)) {
      await reply(conversation.id, phone, WELCOME);
    }
    await saveContext(conversation.id, ctx, "chat");
    await writeLead(contactId, conversation.id, phone, ctx, "NEW");
    return { stage: "chat" };
  }

  const history = await listRecentMessages(conversation.id, 8);
  if (looksLikeFormAnswer(conversation.stage, text, lastAssistantText(history))) {
    return continueForm(conversation, contactId, phone, text, ctx);
  }

  const answer = await answerClient({
    text,
    stage: conversation.stage === "welcome" || conversation.stage === "need" ? "chat" : conversation.stage,
    ctx,
    history: history.slice(0, -1),
  });

  if (answer.lastTopic) ctx.lastTopic = answer.lastTopic;
  const stage = FORM_STAGES.has(conversation.stage) && conversation.stage !== "recommend" ? "chat" : conversation.stage === "welcome" || conversation.stage === "need" ? "chat" : conversation.stage || "chat";

  if (answer.handoff) {
    await reply(conversation.id, phone, answer.text);
    const lead = await writeLead(contactId, conversation.id, phone, ctx, "HUMAN_HANDOFF");
    await saveConversation(conversation.id, { control: "HUMAN", stage: "handoff", handoff: true });
    await notifyOwner(
      "ZENTRA WHATSAPP — HUMAN NEEDED",
      [`Phone: ${phone}`, `Reason: ${text.slice(0, 280)}`].join("\n"),
      phone,
    );
    return { handoff: true };
  }

  await reply(conversation.id, phone, answer.text);
  if (answer.qualify) await maybeNotifyQualified(conversation, contactId, phone, ctx);
  await saveContext(conversation.id, ctx, stage);
  await writeLead(
    contactId,
    conversation.id,
    phone,
    ctx,
    answer.qualify ? "QUALIFYING" : ctx.serviceInterest || ctx.problem ? "QUALIFYING" : "NEW",
  );
  return { chat: true };
}

async function continueForm(
  conversation: ChatConversation,
  contactId: string,
  phone: string,
  text: string,
  ctx: LeadContext,
) {
  let stage = conversation.stage;

  if (stage === "name") {
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
      phone,
    );
    await reply(
      conversation.id,
      phone,
      `${recommendationCopy(ctx.packageInterest)}\n\nWhat would you like to do next?\n\n1. Start a project\n2. Talk to the team\n3. See what's included`,
    );
    return { stage };
  }

  if (stage === "recommend") {
    const value = text.trim();
    if (/^2\b/.test(value) || wantsHandoff(text)) {
      const lead = await writeLead(contactId, conversation.id, phone, ctx, "HUMAN_HANDOFF");
      await handoff(conversation, lead, phone, text);
      return { handoff: true };
    }
    if (/^3\b/.test(value) || /included|what's in|whats in/i.test(value)) {
      const features = PACKAGE_FEATURES[ctx.packageInterest ?? "growth"] ?? PACKAGE_FEATURES.growth;
      await reply(
        conversation.id,
        phone,
        `${packageLabel(ctx.packageInterest) || "Growth"} includes:\n${features
          .split("; ")
          .map((item) => `• ${item}`)
          .join("\n")}\n\nWant to start a project, or talk it through with the team?`,
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
      phone,
    );
    return { complete: true };
  }

  const history = await listRecentMessages(conversation.id);
  const answer = await answerClient({
    text,
    stage,
    ctx,
    history: history.slice(0, -1),
  });
  await reply(conversation.id, phone, answer.text);
  await saveContext(conversation.id, ctx, "chat");
  return { chat: true };
}
