export type KnowledgeChunk = {
  id: string;
  tags: string[];
  answer: string;
};

export const KNOWLEDGE: KnowledgeChunk[] = [
  {
    id: "ada",
    tags: ["name", "ada", "who", "you", "bot", "assistant", "ai", "robot"],
    answer:
      "I'm Ada — I help at Zentra. I can answer questions, talk through what you need, and get a person from the team if you'd rather speak with someone.",
  },
  {
    id: "founder",
    tags: ["founder", "david", "owner", "ceo", "started", "built", "runs", "who"],
    answer:
      "David founded Zentra. If you'd like to speak with him or someone from the team, say the word and I'll connect you.",
  },
  {
    id: "company",
    tags: ["zentra", "company", "about", "what", "do", "does", "studio", "agency"],
    answer:
      "Zentra builds practical technology for businesses — websites, automation (including WhatsApp), customer systems, and custom software. We start from how the work actually happens, then recommend what is realistic to build.\n\nWhat's slowing you down right now?",
  },
  {
    id: "process",
    tags: ["process", "work", "works", "how", "steps", "consult", "explain", "approach"],
    answer: [
      "Here's how we work — it's simple.",
      "1. You tell us what's slowing the business down. A short conversation is enough.",
      "2. We recommend the right approach, with a clear scope, timeline and cost — before anything is built.",
      "3. We build and test it.",
      "4. We launch it and show your team how to use it.",
      "No vague proposals. You know the plan first.\n\nWhat would you like help with?",
    ].join("\n"),
  },
  {
    id: "packages",
    tags: ["package", "packages", "price", "pricing", "cost", "how", "much", "starter", "growth", "scale", "naira"],
    answer:
      "Three starting points:\n\n*Starter* from ₦250,000 — a proper website and WhatsApp.\n*Growth* from ₦650,000 — website, enquiries, a simple customer list, and less manual work.\n*Scale* from ₦1,500,000 — custom systems, scoped after we talk.\n\nWhich sounds closest, or tell me the problem you're trying to fix?",
  },
  {
    id: "starter",
    tags: ["starter", "cheap", "small", "first", "begin", "basic", "simple"],
    answer:
      "Starter is for getting found properly. A professional site that works on a phone, a simple way for customers to reach you, WhatsApp on the site, a form so enquiries aren't lost, and we put it live for you. From ₦250,000.",
  },
  {
    id: "growth",
    tags: ["growth", "enquir", "leads", "follow", "crm", "busy", "messages", "pile"],
    answer:
      "Growth is for when people are already reaching you, but follow-up is messy. Website, WhatsApp or Instagram replies, lead tracking, a simple customer list, less repetitive work, then launch and training. From ₦650,000.",
  },
  {
    id: "scale",
    tags: ["scale", "custom", "software", "dashboard", "integrate", "spreadsheet", "system"],
    answer:
      "Scale is for businesses that need something built around how they already work — a custom website or web app, WhatsApp as part of one system, a customer system the team can run, automation across people and tools, dashboards. From ₦1,500,000, confirmed after we talk.",
  },
  {
    id: "website",
    tags: ["website", "site", "web", "page", "landing", "online"],
    answer:
      "Yes — we build websites and web apps, from a simple site that works well on a phone to something custom. We can also add WhatsApp and an enquiry form so messages don't get lost.\n\nDo you already have a site, or would this be new?",
  },
  {
    id: "existing-site",
    tags: ["already", "existing", "have", "current", "old"],
    answer:
      "Yes — we can work with a site you already have, or build a new one if this one isn't doing the job. A lot of people come for automation and enquiry follow-up on top of what they already have.\n\nWhat would you like to improve?",
  },
  {
    id: "automation",
    tags: ["automat", "whatsapp", "instagram", "ai", "chatbot", "reply", "busy", "repeat"],
    answer:
      "Yes. We set up WhatsApp and other automation so customers get a reply, enquiries aren't lost, and the team isn't typing the same thing all day. I'm an example of that kind of help.\n\nIs that what you need, or is it more of a website or a customer system?",
  },
  {
    id: "crm",
    tags: ["crm", "customer", "customers", "leads", "follow", "list", "pipeline"],
    answer:
      "A customer system (CRM) is simply a place to keep people, leads and follow-up so nothing sits in someone's head or a random chat. We build one your team can actually run — not a tool nobody opens.\n\nHow do you keep track of customers today?",
  },
  {
    id: "software",
    tags: ["software", "app", "tool", "spreadsheet", "internal", "custom"],
    answer:
      "If the work lives in spreadsheets, chats and memory, we can turn that into software your team uses every day. We don't guess the features — we watch how you work, then build around that.\n\nWhat does the team still do by hand?",
  },
  {
    id: "marketing",
    tags: ["marketing", "ads", "customers", "found", "growth", "instagram", "leads"],
    answer:
      "We help with getting found and turning that into real enquiries — not empty traffic. Often that sits with a better site, WhatsApp, and a way to follow up.\n\nWhere do most of your customers find you now?",
  },
  {
    id: "timeline",
    tags: ["long", "soon", "timeline", "when", "days", "weeks", "duration", "fast"],
    answer:
      "It depends on the work. After a short conversation we give a clear scope, timeline and cost — before anything is built. That's the point: you know the plan first. Want to tell me what you need?",
  },
  {
    id: "location",
    tags: ["where", "nigeria", "lagos", "location", "based", "country"],
    answer: "We're in Nigeria. We work with businesses here and remotely. What are you looking to get done?",
  },
  {
    id: "who-for",
    tags: ["small", "business", "sme", "company", "startup", "who"],
    answer:
      "We work with small businesses and larger companies. If customers can't find you, enquiries pile up, or the team repeats the same tasks every day — that's the kind of problem we take on.",
  },
  {
    id: "handoff",
    tags: ["human", "person", "david", "team", "someone", "call", "speak"],
    answer: "Of course. I can get someone from the team on this chat now — they'll pick it up from here.",
  },
  {
    id: "social-how-are-you",
    tags: ["how", "are", "you", "going", "feeling"],
    answer: "I'm doing well, thanks for asking. How are you?",
  },
  {
    id: "thanks",
    tags: ["thank", "thanks", "appreciate"],
    answer: "You're welcome. I'm here if you need anything else.",
  },
];

const STOP = new Set([
  "the",
  "and",
  "for",
  "you",
  "your",
  "our",
  "are",
  "is",
  "was",
  "this",
  "that",
  "with",
  "from",
  "have",
  "has",
  "not",
  "but",
  "can",
  "could",
  "would",
  "should",
  "please",
  "just",
  "about",
  "into",
  "them",
  "they",
  "their",
  "what",
  "when",
  "which",
  "than",
  "then",
  "also",
  "very",
  "more",
  "some",
  "any",
  "does",
  "did",
  "how",
  "who",
  "why",
]);

const SYNONYMS: Record<string, string[]> = {
  founder: ["david", "owner", "ceo", "started"],
  process: ["work", "works", "steps", "consult", "explain"],
  price: ["cost", "pricing", "much", "package", "naira"],
  website: ["site", "web", "page"],
  automation: ["whatsapp", "instagram", "chatbot", "ai", "reply"],
  crm: ["leads", "customers", "follow"],
  ada: ["name", "bot", "assistant"],
};

function tokens(text: string) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP.has(word));
  const extra: string[] = [];
  for (const word of words) {
    extra.push(word);
    for (const [key, values] of Object.entries(SYNONYMS)) {
      if (word === key || values.includes(word)) extra.push(key, ...values);
    }
  }
  return [...new Set(extra)];
}

export function retrieveKnowledge(query: string, limit = 4) {
  const queryTokens = tokens(query);
  if (queryTokens.length === 0) return [];

  return KNOWLEDGE.map((chunk) => {
    let score = 0;
    for (const token of queryTokens) {
      if (chunk.id === token) score += 5;
      if (chunk.tags.some((tag) => tag.includes(token) || token.includes(tag))) score += 3;
      if (chunk.answer.toLowerCase().includes(token)) score += 1;
    }
    return { chunk, score };
  })
    .filter((item) => item.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.chunk);
}

export function knowledgePrompt() {
  return KNOWLEDGE.map((chunk) => `### ${chunk.id}\n${chunk.answer}`).join("\n\n");
}
