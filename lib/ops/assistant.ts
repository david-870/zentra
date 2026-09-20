import { completeChat } from "@/lib/ops/ai";
import type { LeadContext } from "@/lib/ops/qualify";

export const ASSISTANT_NAME = "Ada";

export const SYSTEM_PROMPT = `You are ${ASSISTANT_NAME}, Zentra's WhatsApp assistant. You are a real conversation partner, not a form.

Zentra is a Nigerian technology studio. We help businesses get found, keep up with enquiries, and cut repetitive work. We build websites, automation (including WhatsApp), CRM / customer systems, custom software, and marketing systems.

Who you are:
- Your name is ${ASSISTANT_NAME}. You work with Zentra.
- You can small-talk. If they ask how you are, answer like a person, then you can offer help.
- You can answer “what’s your name?”, who you are, what Zentra does, packages, process, and how we work.
- You understand follow-up questions and slightly complicated ones. Answer in plain language.

How you talk:
- Warm, clear, intelligent. Short WhatsApp messages. Usually 1–3 short paragraphs.
- Sound human. No brochure tone, no numbered interrogation unless they asked for options.
- You can use a little humour. Don’t be silly.

Facts you may quote. Never invent anything else:
- Founder: David. He started Zentra. If they want to speak with him, offer to connect a person from the team.
- Starter from ₦250,000: professional website, contact, WhatsApp on the site, enquiry form, we put it live.
- Growth from ₦650,000: website, help with enquiries / WhatsApp or Instagram, lead tracking, simple customer list, less manual work, launch and training.
- Scale from ₦1,500,000: custom website or software, WhatsApp as part of one system, CRM, automation across the team, dashboards, scoped after a conversation.
- Process: short consult → clear scope, timeline and cost → we build and test → we launch and train the team.
- We work with small businesses and larger companies. We are based in Nigeria.
- People can keep chatting here. A person from the Zentra team can join whenever they ask.

Never:
- Invent clients, testimonials, results, discounts, extra prices, or exact delivery dates.
- Give out a phone number. They are already on WhatsApp with us.
- Pretend you are David or a human on the team. If they want a person, say you will connect them and reply with HANDOFF on its own line at the end.
- Ask five questions at once.

If they are chatting socially, chat back. When it is natural, ask what they would like help with. If you are unsure, say so and offer to get someone from the team.`;

export function isNumberedChoice(text: string) {
  return /^[1-7]([.)\s]|$)/.test(text.trim());
}

export function isConversational(text: string) {
  const value = text.toLowerCase().trim();
  if (!value || isNumberedChoice(value)) return false;
  if (/\?/.test(value)) return true;
  if (
    /^(who|what|when|where|why|how|can you|could you|would you|do you|does|are you|is this|is zentra|tell me|explain)\b/.test(
      value,
    )
  ) {
    return true;
  }
  return /how are you|how’re you|how are u|how’s it going|who are you|your name|about you|where are you|nice to meet|thank you|thanks|pls\b|please|lol|haha|i'm fine|i am fine|i’m good|not bad|and you/.test(
    value,
  );
}

export function looksLikePersonName(text: string) {
  if (isConversational(text)) return false;
  const value = text.replace(/^(my name is|i am|i'm|i’m|call me)\s+/i, "").trim();
  if (!value || value.length > 48) return false;
  if (/[?]/.test(value)) return false;
  const words = value.split(/\s+/);
  return words.length <= 4 && !/\d/.test(value);
}

function howZentraWorks() {
  return [
    "Here's how we work — it's simple.",
    "1. You tell us what's slowing the business down. A short conversation is enough.",
    "2. We recommend the right approach, with a clear scope, timeline and cost — before anything is built.",
    "3. We build and test it.",
    "4. We launch it and show your team how to use it.",
    "No vague proposals. You know the plan first.\n\nWhat would you like help with?",
  ].join("\n");
}

function matchFaq(text: string) {
  const value = text.toLowerCase().trim();

  if (/how are you|how’re you|how are u|how’s it going|how is it going/.test(value)) {
    return "I'm doing well, thanks for asking. How are you?";
  }
  if (/i'm fine|i am fine|i’m good|i'm good|doing well|not bad/.test(value) && /you/.test(value) === false) {
    return "Glad to hear it. What can I help you with today?";
  }
  if (/thank|thanks|appreciate/.test(value) && value.length < 40) {
    return "You're welcome. I'm here if you need anything else.";
  }
  if (/founder|who (started|owns|runs|built) zentra|who is david/.test(value)) {
    return "David founded Zentra. If you'd like to speak with him or someone from the team, say the word and I'll connect you.";
  }
  if (/your name|who are you|who is this|are you a (bot|robot|ai)|what should i call you/.test(value)) {
    return `I'm ${ASSISTANT_NAME} — I help at Zentra. I can answer questions, talk through what you need, and get a person from the team if you'd rather speak with someone.`;
  }
  if (/where are you|where is zentra|location|based/.test(value)) {
    return "We're in Nigeria. We work with businesses here and remotely. What are you looking to get done?";
  }
  if (
    /how (does|do) zentra|how zentra work|explain how zentra|how (do|does) (you|it|this) work|how we work|what's the process|what is the process|the process/.test(
      value,
    )
  ) {
    return howZentraWorks();
  }
  if (/what is zentra|what's zentra|who is zentra|about zentra|what do you (guys )?do|what does zentra/.test(value)) {
    return "Zentra builds practical technology for businesses — websites, automation (including WhatsApp), customer systems, and custom software. We start from how the work actually happens, then recommend what is realistic to build.\n\nWhat’s slowing you down right now?";
  }
  if (/how (long|soon)|timeline|how many (days|weeks)|when can you/.test(value)) {
    return "It depends on the work. After a short conversation we give a clear scope, timeline and cost — before anything is built. Want to tell me what you need?";
  }
  if (/price|pricing|cost|how much|package/.test(value)) {
    return "Three starting points:\n\n*Starter* from ₦250,000 — a proper website and WhatsApp.\n*Growth* from ₦650,000 — website, enquiries, a simple customer list, and less manual work.\n*Scale* from ₦1,500,000 — custom systems, scoped after we talk.\n\nWhich sounds closest, or tell me the problem you're trying to fix?";
  }
  if (/website|web app|landing page/.test(value) && /do you|can you|build|make|create/.test(value)) {
    return "Yes — we build websites and web apps, from a simple site that works well on a phone to something custom. We can also add WhatsApp and an enquiry form so messages don't get lost.\n\nDo you already have a site, or would this be new?";
  }
  if (/already have a (web)?site|existing site/.test(value)) {
    return "Yes — we can work with a site you already have, or build a new one if this one isn't doing the job. A lot of people come for automation and enquiry follow-up on top of what they already have.\n\nWhat would you like to improve?";
  }
  if (/whatsapp|automat|ai assistant|chatbot/.test(value) && /how|what|can you|do you/.test(value)) {
    return "Yes. We set up WhatsApp and other automation so customers get a reply, enquiries aren't lost, and the team isn't typing the same thing all day. I'm an example of that kind of help.\n\nIs that what you need, or is it more of a website or a customer system?";
  }

  return null;
}

function systemPromptFor(ctx: LeadContext, stage: string) {
  const known = [
    ctx.name ? `Their name: ${ctx.name}` : null,
    ctx.businessName ? `Business: ${ctx.businessName}` : null,
    ctx.businessDescription ? `What they do: ${ctx.businessDescription}` : null,
    ctx.problem ? `Problem: ${ctx.problem}` : null,
    ctx.serviceInterest ? `Interest: ${ctx.serviceInterest}` : null,
    `Current flow stage: ${stage}`,
  ]
    .filter(Boolean)
    .join("\n");
  return `${SYSTEM_PROMPT}\n\nWhat you already know about this person:\n${known || "Nothing yet — that's fine."}`;
}

export async function answerClient(input: {
  text: string;
  stage: string;
  ctx: LeadContext;
  history: { role: "user" | "assistant"; content: string }[];
}) {
  const faq = matchFaq(input.text);
  if (faq) return { text: faq, handoff: false };

  try {
    const generated = await completeChat([
      { role: "system", content: systemPromptFor(input.ctx, input.stage) },
      ...input.history.slice(-12),
      { role: "user", content: input.text },
    ]);

    if (generated) {
      const handoff = /(?:^|\n)HANDOFF\s*$/.test(generated.trim());
      const text = generated.replace(/(?:^|\n)HANDOFF\s*$/, "").trim();
      return { text: text || faq || "", handoff };
    }
  } catch (error) {
    console.error(error);
  }

  return {
    text: "I don't have a solid answer for that one yet. I can tell you how Zentra works, the packages, or get someone from the team.\n\nWant the process, the prices, or a person?",
    handoff: false,
  };
}
