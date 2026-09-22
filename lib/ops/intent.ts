import type { LeadContext } from "@/lib/ops/qualify";

export type AdaIntent =
  | "greeting"
  | "business_information"
  | "founder"
  | "services"
  | "website"
  | "software"
  | "ai_assistant"
  | "automation"
  | "whatsapp"
  | "crm"
  | "marketing"
  | "pricing"
  | "packages"
  | "process"
  | "timeline"
  | "portfolio"
  | "existing_site"
  | "training"
  | "internship"
  | "mentorship"
  | "hiring"
  | "eligibility"
  | "clarify_build"
  | "identity"
  | "recommend"
  | "handoff"
  | "start_project"
  | "complaint"
  | "unknown";

const SHORT_MESSAGE: Record<string, AdaIntent> = {
  website: "website",
  site: "website",
  app: "software",
  apps: "software",
  software: "software",
  automation: "automation",
  pricing: "pricing",
  price: "pricing",
  prices: "pricing",
  marketing: "marketing",
  ai: "ai_assistant",
  whatsapp: "whatsapp",
  crm: "crm",
  training: "training",
  courses: "training",
  course: "training",
  internships: "internship",
  internship: "internship",
};

const INTENT_HINTS: { intent: AdaIntent; pattern: RegExp }[] = [
  {
    intent: "complaint",
    pattern:
      /\b(complaint|this is (rubbish|useless)|i'm angry|scam|want a refund|not happy with|waiting for days|nobody has responded|your (website|system) isn'?t working)\b/i,
  },
  {
    intent: "handoff",
    pattern:
      /\b((speak|talk) (to|with) (someone|a person|a human|the team|the founder|the owner|the developer|david)|real person|human agent|i want a human|connect me|someone from the team|can someone call|call me back)\b/i,
  },
  { intent: "internship", pattern: /\b(intern(ship)?s?|can i work with zentra as an intern)\b/i },
  { intent: "mentorship", pattern: /\b(mentor(ship)?s?)\b/i },
  { intent: "hiring", pattern: /\b(hiring|hire (me|developers)|job opening|vacanc|are you hiring)\b/i },
  { intent: "founder", pattern: /\b(founder|founded|ceo|who (owns|started|runs|is behind)|who is david)\b/i },
  {
    intent: "training",
    pattern:
      /\b(teach|learn|class(es)?|course(s)?|coding|html|css|react|wordpress|beginner|online class|physical class|web development from|how to build|train(ing)?)\b/i,
  },
  {
    intent: "eligibility",
    pattern:
      /\b(small business|startup|one-?person|sole (trader|owner)|still new|don't have a website yet|do you work with|only work with big|established compan|large compan|small budget|individuals)\b/i,
  },
  {
    intent: "clarify_build",
    pattern: /^i want to build (a |an )?(website|web app|app|application|chatbot|ai|automation)\b/i,
  },
  { intent: "start_project", pattern: /\b(start (the |a )?project|i want to start|let's start|ready to (start|begin)|count me in)\b/i },
  { intent: "pricing", pattern: /\b(how much|price|pricing|cost|cheap|cheapest|budget|₦|naira)\b/i },
  { intent: "packages", pattern: /\b(package|starter|growth|scale|standard|complete|premium|business package|custom package)\b/i },
  { intent: "process", pattern: /\b(how (do you|does (it|zentra)|una dey) work|process|steps|how you work)\b/i },
  { intent: "timeline", pattern: /\b(how long|timeline|how soon|when can|duration)\b/i },
  { intent: "existing_site", pattern: /\b(already (have|get|got) (a )?website|existing site|current site|old website|isn't generating)\b/i },
  { intent: "whatsapp", pattern: /\b(whatsapp|wa\b)/i },
  { intent: "ai_assistant", pattern: /\b(ai (assistant|chatbot|bot)|chatbot|chat bot)\b/i },
  { intent: "automation", pattern: /\b(automate|automation|automat\w*|auto[- ]?reply|replies)\b/i },
  { intent: "crm", pattern: /\b(crm|customer system|customer list|follow[- ]?up)\b/i },
  { intent: "marketing", pattern: /\b(marketing|ads|get (more )?customers|traffic)\b/i },
  { intent: "website", pattern: /\b(website|web app|webapp|landing|online store|ecommerce|e-commerce)\b/i },
  { intent: "software", pattern: /\b(software|mobile app|\bapp\b|application|dashboard)\b/i },
  {
    intent: "services",
    pattern:
      /\b(services|what do you (do|offer|build)|what (exactly )?do you guys do|what does zentra( actually)? do|kind of company|how can you help)\b/i,
  },
  { intent: "business_information", pattern: /\b(what is zentra|about (zentra|your company|the company|your agency|the agency)|tell me (more )?about (zentra|your company|the company|your agency)|who (is|are) zentra|kind of business|who do you work with|small business|know about (your )?(agency|zentra|company)|your agency)\b/i },
  { intent: "recommend", pattern: /\b(recommend|suggest|what should i (get|choose|pick|go for)|which package|best (for me|option)|help me choose)\b/i },
  { intent: "portfolio", pattern: /\b(portfolio|your work|case stud|projects you('ve| have)? (done|built))\b/i },
  { intent: "identity", pattern: /\b(who are you|what('?s| is) your name|are you ada|are you a (bot|person|human|robot))\b/i },
  { intent: "greeting", pattern: /^(h+|hi+|hii+|hello|hey+|yo|good (morning|afternoon|evening)|how far)(?:\s+there)?[\s!.]*$/i },
];

export function foldText(text: string) {
  return text.replace(/[\u2018\u2019\u201B\uFF07]/g, "'").toLowerCase().trim();
}

export function lastAssistantText(history: { role: string; content: string }[]) {
  return [...history].reverse().find((item) => item.role === "assistant")?.content ?? "";
}

export function topicFromText(text: string): LeadContext["lastTopic"] {
  const value = text.toLowerCase();
  if (/\bwebsite\b|web app|webapp|landing|online store|ecommerce|e-commerce|online shop/.test(value)) return "website";
  if (/\bwhatsapp\b/.test(value)) return "whatsapp";
  if (/\bai\b|chatbot|assistant/.test(value)) return "ai_assistant";
  if (/automat/.test(value)) return "automation";
  if (/\bcrm\b|customer system/.test(value)) return "crm";
  if (/software|mobile app|\bapp\b/.test(value)) return "software";
  if (/marketing/.test(value)) return "marketing";
  if (/package|starter|growth|scale|standard|complete|premium|business package|custom package/.test(value)) return "packages";
  return undefined;
}

export function detectIntent(
  text: string,
  ctx: LeadContext,
  history: { role: string; content: string }[] = [],
): { intent: AdaIntent; topic?: string } {
  const value = foldText(text);
  const short = SHORT_MESSAGE[value.replace(/[!?.]+$/g, "")];
  if (short) return { intent: short, topic: topicFromIntent(short) || topicFromText(value) };

  const previous = lastAssistantText(history);
  const followUp = /^(how much\??|how does it work\??|can you do it\??|can it\b.*|what about mine\??|and (the )?price\??)$/i.test(
    value,
  );

  if (followUp) {
    const topic = ctx.lastTopic || topicFromText(previous);
    if (/how much|price/.test(value)) return { intent: "pricing", topic };
    if (/how does it work/.test(value)) return { intent: topic ? (topic as AdaIntent) : "process", topic };
    if (/can you do it|can it/.test(value)) return { intent: (topic as AdaIntent) || "services", topic };
    if (/what about mine/.test(value)) return { intent: "existing_site", topic: topic || "website" };
  }

  for (const hint of INTENT_HINTS) {
    if (!hint.pattern.test(value)) continue;
    if (hint.intent === "clarify_build" && /\bfor my (business|company|shop|brand|page)\b/.test(value)) {
      const topic = topicFromText(value) || "website";
      const intent = topic === "software" || topic === "automation" || topic === "whatsapp" || topic === "ai_assistant" ? topic : "website";
      return { intent, topic };
    }
    if (hint.intent === "training" && /\bfor my (business|company|shop)\b/.test(value) && !/\b(teach|learn|class|course)\b/.test(value)) {
      continue;
    }
    return { intent: hint.intent, topic: topicFromText(value) || topicFromIntent(hint.intent) || ctx.lastTopic };
  }

  if (/una dey|wetin una|abeg|i wan|i dey need/.test(value)) {
    if (/work/.test(value)) return { intent: "process" };
    if (/website|site/.test(value)) return { intent: "website" };
    if (/app/.test(value)) return { intent: "software" };
    if (/how much/.test(value)) return { intent: "pricing", topic: topicFromText(value) || ctx.lastTopic };
  }

  return { intent: "unknown", topic: ctx.lastTopic };
}

function topicFromIntent(intent: AdaIntent) {
  if (
    intent === "website" ||
    intent === "software" ||
    intent === "automation" ||
    intent === "whatsapp" ||
    intent === "ai_assistant" ||
    intent === "crm" ||
    intent === "marketing" ||
    intent === "packages"
  ) {
    return intent;
  }
  return undefined;
}

export function numberedService(text: string) {
  const value = text.trim();
  if (/^1\b/.test(value)) return "website";
  if (/^2\b/.test(value)) return "automation";
  if (/^3\b/.test(value)) return "crm";
  if (/^4\b/.test(value)) return "software";
  if (/^5\b/.test(value)) return "marketing";
  if (/^6\b/.test(value)) return "packages";
  if (/^7\b/.test(value)) return "human";
  return null;
}
