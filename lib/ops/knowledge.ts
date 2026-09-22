import { BUSINESS, businessPrompt } from "@/lib/ops/business-context";
import { SERVICE_GUIDES } from "@/lib/ops/service-guide";

export type KnowledgeChunk = {
  id: string;
  tags: string[];
  answer: string;
};

export const KNOWLEDGE: KnowledgeChunk[] = [
  {
    id: "company",
    tags: ["zentra", "company", "about", "what", "do", "does", "studio", "agency", "help"],
    answer: `${BUSINESS.what}\n\n${BUSINESS.value}\n\n${BUSINESS.whoFor}`,
  },
  {
    id: "founder",
    tags: ["founder", "david", "owner", "ceo", "started", "built", "runs", "who"],
    answer: `${BUSINESS.founder.known} ${BUSINESS.founder.unknown}`,
  },
  {
    id: "ada",
    tags: ["name", "ada", "who", "you", "bot", "assistant", "ai", "robot"],
    answer:
      "I'm Ada — I help at Zentra. I can answer questions, explain the work, talk through what you need, and get a person from the team if you'd rather speak with someone.",
  },
  {
    id: "process",
    tags: ["process", "work", "works", "how", "steps", "consult", "approach"],
    answer: `${BUSINESS.process.headline}\n${BUSINESS.process.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}\n${BUSINESS.process.support}`,
  },
  {
    id: "packages",
    tags: ["package", "packages", "price", "pricing", "cost", "how", "much", "starter", "business", "custom", "growth", "scale", "naira"],
    answer: BUSINESS.packages.map((item) => `*${item.name}* — ${item.price}. ${item.description}`).join("\n"),
  },
  {
    id: "website",
    tags: ["website", "site", "web", "page", "landing", "online", "webapp", "entail", "explain"],
    answer: SERVICE_GUIDES.website.answer,
  },
  {
    id: "automation",
    tags: ["automat", "whatsapp", "instagram", "ai", "chatbot", "reply", "busy", "repeat", "messages"],
    answer: SERVICE_GUIDES.automation.answer,
  },
  {
    id: "crm",
    tags: ["crm", "customer", "customers", "leads", "follow", "list", "pipeline"],
    answer: SERVICE_GUIDES.crm.answer,
  },
  {
    id: "software",
    tags: ["software", "app", "tool", "spreadsheet", "internal", "custom", "mobile"],
    answer: SERVICE_GUIDES.software.answer,
  },
  {
    id: "marketing",
    tags: ["marketing", "ads", "found", "growth", "instagram"],
    answer: SERVICE_GUIDES.marketing.answer,
  },
  {
    id: "existing-site",
    tags: ["already", "existing", "have", "current", "old", "shopify", "wordpress", "developer", "migrate", "audit", "integrate"],
    answer: BUSINESS.existingSystems,
  },
  {
    id: "marketing-vs-tech",
    tags: ["ads", "content", "instagram", "tiktok", "facebook", "brand", "followers", "leads", "strategy"],
    answer: BUSINESS.marketingVsTech,
  },
  {
    id: "hosting",
    tags: ["domain", "hosting", "host", "maintain", "maintenance", "support", "monthly", "down"],
    answer: BUSINESS.hosting,
  },
  {
    id: "payment-terms",
    tags: ["deposit", "instalment", "installment", "payment", "plan", "pay"],
    answer: BUSINESS.paymentTerms,
  },
  {
    id: "careers",
    tags: ["intern", "internship", "mentor", "hiring", "freelance", "student", "developer", "join"],
    answer: BUSINESS.careers,
  },
  {
    id: "partnership",
    tags: ["partner", "collaborate", "referral", "reseller"],
    answer: BUSINESS.partnership,
  },
  {
    id: "location-remote",
    tags: ["nigeria", "nigerian", "international", "remotely", "based", "office"],
    answer: BUSINESS.credibility,
  },
  {
    id: "free-work",
    tags: ["free"],
    answer: BUSINESS.freeWork,
  },
  {
    id: "consultation",
    tags: ["consultation", "discount", "promo", "offer"],
    answer: BUSINESS.consultation,
  },
  {
    id: "timeline",
    tags: ["long", "soon", "timeline", "when", "days", "weeks", "duration", "fast"],
    answer:
      "It depends on the work. After a short conversation we give a clear scope, timeline and cost — before anything is built. There isn't a single number of days that fits every project.",
  },
  {
    id: "location",
    tags: ["where", "nigeria", "lagos", "abuja", "location", "based", "country", "office"],
    answer: `${BUSINESS.location.known} ${BUSINESS.location.unknownOffices}`,
  },
  {
    id: "training",
    tags: ["teach", "learn", "class", "course", "training", "html", "css", "react", "wordpress", "intern", "mentor", "hiring"],
    answer:
      "Zentra builds systems for businesses. There is no confirmed public coding school, internship, mentorship or jobs board in the assistant's knowledge. After a project we show the client's team how to use what we built. If someone wants to learn, say that clearly and offer the team rather than inventing a course.",
  },
  {
    id: "eligibility",
    tags: ["small", "startup", "individual", "established", "budget", "new", "one"],
    answer: `${BUSINESS.whoFor} ${BUSINESS.eligibility.smallAndNew} ${BUSINESS.eligibility.established} ${BUSINESS.eligibility.noWebsiteYet}`,
  },
  {
    id: "handoff",
    tags: ["human", "person", "david", "team", "someone", "call", "speak"],
    answer: "Of course. I can get someone from the team on this chat now — they'll pick it up from here.",
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
  process: ["work", "works", "steps", "consult"],
  price: ["cost", "pricing", "much", "package", "naira"],
  website: ["site", "web", "page", "landing", "webapp"],
  automation: ["whatsapp", "instagram", "chatbot", "ai", "reply", "messages"],
  crm: ["leads", "customers", "follow", "pipeline"],
  software: ["app", "tool", "spreadsheet", "system", "custom", "mobile"],
  marketing: ["ads", "traffic", "found"],
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
  return businessPrompt();
}
