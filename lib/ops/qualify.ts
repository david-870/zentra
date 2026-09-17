export type LeadContext = {
  name?: string;
  businessName?: string;
  businessDescription?: string;
  problem?: string;
  serviceInterest?: string;
  packageInterest?: string;
  budgetRange?: string;
  source?: string;
  extraQuestion?: string;
};

export const WELCOME = [
  "Hi 👋 Welcome to Zentra.",
  "We help businesses build better digital systems, automate repetitive work and grow through technology.",
  "What can we help you with?",
  "1. Website / Web Application\n2. AI & Automation\n3. CRM / Customer Systems\n4. Custom Software\n5. Marketing & Growth\n6. View Zentra Packages\n7. Talk to a Human",
].join("\n\n");

const HANDOFF_PHRASES = [
  "talk to a human",
  "talk to someone",
  "talk to human",
  "speak with someone",
  "speak to someone",
  "speak with the",
  "speak to the",
  "speak with david",
  "speak to david",
  "talk to david",
  "can i speak",
  "want to talk",
  "real person",
  "your team",
  "question for your team",
];

export function wantsHandoff(text: string) {
  const value = text.toLowerCase().trim();
  if (/^7\b/.test(value)) return true;
  return HANDOFF_PHRASES.some((phrase) => value.includes(phrase));
}

export function detectNeed(text: string): Partial<LeadContext> | null {
  const value = text.toLowerCase();

  if (/\bstarter\b/.test(value)) return { packageInterest: "starter", serviceInterest: "website", source: sourceFrom(value) };
  if (/\bgrowth\b/.test(value) && !/marketing/.test(value)) {
    return { packageInterest: "growth", serviceInterest: "automation", source: sourceFrom(value) };
  }
  if (/\bscale\b/.test(value)) return { packageInterest: "scale", serviceInterest: "software", source: sourceFrom(value) };

  if (/\bwebsite\b|\bweb app|\bweb application|\blanding page/.test(value)) {
    return { serviceInterest: "website", source: sourceFrom(value) };
  }
  if (/\bai\b|\bautomat/.test(value) || value.includes("whatsapp") || value.includes("instagram")) {
    return { serviceInterest: "automation", source: sourceFrom(value) };
  }
  if (/\bcrm\b|customer system|leads/.test(value)) return { serviceInterest: "crm", source: sourceFrom(value) };
  if (value === "human" || value === "7") return { serviceInterest: "human" };
  if (value === "packages" || value === "6" || /package|view zentra/.test(value)) {
    return { serviceInterest: "packages", source: sourceFrom(value) };
  }
  if (value === "software" || /custom software|internal tool|spreadsheet/.test(value)) {
    return { serviceInterest: "software", source: sourceFrom(value) };
  }
  if (/marketing|get more customer|ads/.test(value)) return { serviceInterest: "marketing", source: sourceFrom(value) };
  if (/^1\b/.test(value)) return { serviceInterest: "website" };
  if (/^2\b/.test(value)) return { serviceInterest: "automation" };
  if (/^3\b/.test(value)) return { serviceInterest: "crm" };
  if (/^4\b/.test(value)) return { serviceInterest: "software" };
  if (/^5\b/.test(value)) return { serviceInterest: "marketing" };
  if (/^7\b/.test(value)) return { serviceInterest: "human" };

  return null;
}

function sourceFrom(text: string) {
  return /interested in the .+ package/i.test(text) || /build my own solution/i.test(text) ? "website" : "whatsapp";
}

export function detectBudget(text: string) {
  const value = text.toLowerCase().trim();
  if (value === "5" || /not sure|unsure|don't know|dont know/.test(value)) return "Not sure yet";
  if (value === "4" || /1\.5m\+|₦1\.5|from 1\.5|1500/.test(value)) return "₦1.5m+";
  if (value === "3" || /700.*1\.5|₦700k/.test(value)) return "₦700k–₦1.5m";
  if (value === "2" || /300.*700|₦300k/.test(value)) return "₦300k–₦700k";
  if (value === "1" || /100.*300|₦100k/.test(value)) return "₦100k–₦300k";
  return text.trim().slice(0, 80);
}

export function recommendPackage(ctx: LeadContext) {
  const service = ctx.serviceInterest ?? "";
  const problem = `${ctx.problem ?? ""} ${ctx.businessDescription ?? ""}`.toLowerCase();
  const budget = ctx.budgetRange ?? "";

  if (ctx.packageInterest === "starter" || ctx.packageInterest === "growth" || ctx.packageInterest === "scale") {
    return ctx.packageInterest;
  }
  if (service === "software" || /custom app|dashboard|integrat/.test(problem)) return "scale";
  if (service === "automation" || service === "crm" || /crm|automat|ai assistant/.test(problem)) return "growth";
  if (budget.includes("1.5")) return "scale";
  if (budget.includes("650") || budget.includes("300k–₦700") || budget.includes("700k")) return "growth";
  if (service === "website" || service === "marketing") return "starter";
  return "growth";
}

export function extraQuestion(service?: string) {
  switch (service) {
    case "website":
      return "Do you already have a website, or would this be built from scratch?";
    case "automation":
      return "Which parts of your business currently require the most manual work?";
    case "crm":
      return "How are you currently managing your customers and leads?";
    case "software":
      return "What process or system are you trying to build?";
    case "marketing":
      return "Where do most of your customers currently come from?";
    default:
      return "Is there anything else we should know about how you work today?";
  }
}

export function scoreLead(ctx: LeadContext, engaged: boolean) {
  let score = 10;
  if (ctx.problem && ctx.problem.length > 12) score += 18;
  if (ctx.businessName) score += 10;
  if (ctx.businessDescription && ctx.businessDescription.length > 8) score += 10;
  if (ctx.serviceInterest && ctx.serviceInterest !== "packages") score += 12;
  if (ctx.packageInterest) score += 8;
  if (ctx.budgetRange && ctx.budgetRange !== "Not sure yet") score += 14;
  if (ctx.source === "website") score += 8;
  if (engaged) score += 10;
  return Math.min(100, score);
}

export function scoreLabel(score: number) {
  if (score >= 61) return "High";
  if (score >= 31) return "Medium";
  return "Low";
}

export function recommendationCopy(id: string) {
  if (id === "starter") {
    return "Based on what you've told me, the *Starter package* sounds closest to what your business needs.\n\nIt covers a professional site, lead capture, WhatsApp and basic automation.\n\n*Starting from ₦250,000.*";
  }
  if (id === "scale") {
    return "Based on what you've told me, the *Scale package* sounds closest to what your business needs.\n\nIt's a custom technology setup — web app or software, advanced AI, automation, CRM and reporting.\n\n*From ₦1,500,000*, scoped after we talk.";
  }
  return "Based on what you've told me, the *Growth package* sounds closest to what your business needs.\n\nIt combines a functional website, AI assistance, lead capture, CRM and business automation.\n\n*Starting from ₦650,000.*";
}
