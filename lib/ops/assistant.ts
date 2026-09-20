import { completeChat } from "@/lib/ops/ai";
import { knowledgePrompt, retrieveKnowledge } from "@/lib/ops/knowledge";
import type { LeadContext } from "@/lib/ops/qualify";

export const ASSISTANT_NAME = "Ada";

export const SYSTEM_PROMPT = `You are ${ASSISTANT_NAME}, Zentra's WhatsApp assistant. You are intelligent, warm, and specific.

Zentra is a Nigerian technology studio founded by David. We help businesses get found, keep up with enquiries, and cut repetitive work. We build websites, WhatsApp/automation, CRM / customer systems, custom software, and marketing systems.

How you think:
- Answer the actual question first. Never say you “can explain” and then not explain.
- If they describe a messy business problem, interpret it (website, automation, CRM, software, or a mix) in plain language, then ask one good next question.
- Use the conversation so far. Don’t restart like a form.
- Social chat is allowed. If they ask how you are, answer like a person.
- Combine facts when a question needs more than one.

How you talk:
- WhatsApp style. Short. Clear. Human. Usually 2–6 sentences.
- One question at a time if you need more.
- A little humour is fine. Don’t be silly or salesy.

You may only use these facts, plus what the person already told you. Never invent clients, results, discounts, extra prices, or exact delivery dates. Never give out a phone number. Don’t pretend you are David. If they want a person, say so and put HANDOFF on its own last line.

Knowledge:
${knowledgePrompt()}`;

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

export function wantsSmartReply(text: string) {
  if (isNumberedChoice(text)) return false;
  if (isConversational(text)) return true;
  return text.trim().split(/\s+/).filter(Boolean).length >= 8;
}

export function looksLikePersonName(text: string) {
  if (isConversational(text)) return false;
  const value = text.replace(/^(my name is|i am|i'm|i’m|call me)\s+/i, "").trim();
  if (!value || value.length > 48) return false;
  if (/[?]/.test(value)) return false;
  const words = value.split(/\s+/);
  return words.length <= 4 && !/\d/.test(value);
}

function systemPromptFor(ctx: LeadContext, stage: string, retrieved: string) {
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

  return `${SYSTEM_PROMPT}

Most relevant notes for this message:
${retrieved || "None matched closely. Still answer if the knowledge above covers it. If it does not, say you don't have that detail and offer a person from the team."}

What you already know about this person:
${known || "Nothing yet — that's fine."}

Reply now to their latest message. Be useful.`;
}

function fromKnowledge(text: string) {
  const chunks = retrieveKnowledge(text, 2);
  if (chunks.length === 0) return null;
  if (chunks.length === 1) return chunks[0].answer;
  if (chunks[0].answer === chunks[1].answer) return chunks[0].answer;
  return `${chunks[0].answer}\n\n${chunks[1].answer}`;
}

export async function answerClient(input: {
  text: string;
  stage: string;
  ctx: LeadContext;
  history: { role: "user" | "assistant"; content: string }[];
}) {
  const retrieved = retrieveKnowledge(input.text, 4);
  const notes = retrieved.map((chunk) => `- ${chunk.id}: ${chunk.answer}`).join("\n\n");

  try {
    const generated = await completeChat([
      { role: "system", content: systemPromptFor(input.ctx, input.stage, notes) },
      ...input.history.slice(-12),
      { role: "user", content: input.text },
    ]);

    if (generated) {
      const handoff = /(?:^|\n)HANDOFF\s*$/.test(generated.trim());
      const text = generated.replace(/(?:^|\n)HANDOFF\s*$/, "").trim();
      if (text) return { text, handoff };
    }
  } catch (error) {
    console.error(error);
  }

  const local = fromKnowledge(input.text);
  if (local) return { text: local, handoff: retrieved.some((chunk) => chunk.id === "handoff") };

  return {
    text: "I don't have a solid answer for that one yet. I can tell you how Zentra works, the packages, or get someone from the team.\n\nWant the process, the prices, or a person?",
    handoff: false,
  };
}
