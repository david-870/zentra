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
  lastTopic?: string;
  qualifiedNotified?: boolean;
};

export const WELCOME = [
  `Hi — I'm Ada from Zentra.`,
  "We help businesses get found, keep up with customers, and take repetitive work off the team.",
  "Ask me anything about the work, or tell me what's slowing you down. If you prefer a list:",
  "1. Website / web app\n2. Automation\n3. CRM / customers\n4. Custom software\n5. Marketing\n6. See packages\n7. Talk to someone",
].join("\n\n");

export function wantsHandoff(text: string) {
  const value = text.toLowerCase().trim();
  if (/^7\b/.test(value)) return true;
  return (
    /\b((speak|talk) (to|with) (someone|a person|a human|the team|the founder|the owner|the developer|david)|real person|human agent|i want a human|connect me to someone|please connect me|someone from the team|can someone call me|please call me|call me back)\b/i.test(
      value,
    )
  );
}

export function isGreeting(text: string) {
  return /^(hi+|hii+|hello|hey+|yo|how far|good (?:morning|afternoon|evening))[\s!.]*$/i.test(
    text.trim(),
  );
}

export function wantsAdaResume(text: string) {
  if (isGreeting(text) || wantsRestart(text)) return true;
  return /\b(from the website|make inquir|here to (ask|enquir)|i('?m| am) (here )?(from the website|to (ask|enquir)))/i.test(
    text,
  );
}

export function wantsRestart(text: string) {
  return /^(start(?: over)?|menu|restart)[\s!.]*$/i.test(text.trim());
}

export function extractLeadHints(text: string, ctx: LeadContext): Partial<LeadContext> {
  const updates: Partial<LeadContext> = {};
  const trimmed = text.trim();

  const named = trimmed.match(/^(?:my name is|i am|i'm|i’m|call me)\s+([A-Za-z][A-Za-z\s'-]{0,40})$/i);
  if (named && !ctx.name) updates.name = named[1].trim();

  const business = trimmed.match(
    /(?:i run|i own|i have|we run|we own)\s+(?:a |an )?(.+?)(?: business)?[.!]?$/i,
  ) || trimmed.match(/my business is (?:called )?(.+)/i);
  if (business) {
    const value = business[1].trim().replace(/\.$/, "");
    if (!ctx.businessDescription) updates.businessDescription = value;
    if (!ctx.businessName && value.split(/\s+/).length <= 4) updates.businessName = value;
  }

  const problem = trimmed.match(/(?:slowing us down|the problem is|i need help with|we're struggling with)\s+(.+)/i);
  if (problem && !ctx.problem) updates.problem = problem[1].trim();

  return updates;
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
      return "Do you already have a site, or would this be a fresh one?";
    case "automation":
      return "What still has to be done by hand every day?";
    case "crm":
      return "How do you keep track of customers and leads today?";
    case "software":
      return "What would this software actually do for the team?";
    case "marketing":
      return "Where do most of your customers find you now?";
    default:
      return "Anything else I should know about how things work today?";
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

export function firstName(name?: string) {
  return (name ?? "").trim().split(/\s+/)[0] || "";
}

export function packageLabel(id?: string) {
  if (id === "starter") return "Starter";
  if (id === "scale") return "Scale";
  if (id === "growth") return "Growth";
  return id ?? "";
}

export function scoreLabel(score: number) {
  if (score >= 61) return "High";
  if (score >= 31) return "Medium";
  return "Low";
}

export function recommendationCopy(id: string) {
  if (id === "starter") {
    return "From what you've said, *Starter* feels like the right place to begin.\n\nThat's a professional site, a simple way for people to reach you, WhatsApp on the site, and a form so enquiries don't get lost.\n\n*From ₦250,000.*";
  }
  if (id === "scale") {
    return "From what you've said, *Scale* looks like the better fit.\n\nThat's a custom setup — web app or software, automation, a customer system, and reporting, built around how you already work.\n\n*From ₦1,500,000*, confirmed after a quick conversation.";
  }
  return "From what you've said, *Growth* looks like the right fit.\n\nThat's a proper website, plus help with enquiries, a simple customer list, and less repetitive work for the team.\n\n*From ₦650,000.*";
}
