import { BUSINESS } from "@/lib/ops/business-context";
import { capabilityReply, detectCapability, nextTopicFor } from "@/lib/ops/capabilities";
import { detectIntent, lastAssistantText } from "@/lib/ops/intent";
import type { LeadContext } from "@/lib/ops/qualify";
import { detectSituation, situationHandoff, situationReply, situationTopic } from "@/lib/ops/situations";
import { explainService } from "@/lib/ops/service-guide";

function starterPrice() {
  const starter = BUSINESS.packages.find((item) => item.id === "starter");
  return starter?.price ?? "Starting from ₦250,000";
}

function growthPrice() {
  const growth = BUSINESS.packages.find((item) => item.id === "growth");
  return growth?.price ?? "Starting from ₦650,000";
}

function scalePrice() {
  const scale = BUSINESS.packages.find((item) => item.id === "scale");
  return scale?.price ?? "From ₦1,500,000";
}

function packagesBlurb() {
  return BUSINESS.packages
    .map((item) => `*${item.name}* — ${item.price} — ${item.description}`)
    .join("\n");
}

function unknown(detail: string) {
  return `I don't have confirmed information about ${detail}. I don't want to give you the wrong answer. I can connect you with the Zentra team to confirm.`;
}

function withName(ctx: LeadContext, text: string) {
  const name = (ctx.name ?? "").trim().split(/\s+/)[0];
  if (!name) return text;
  return text.replace(/^(Yes|Absolutely|Got it|Sure)\b/, `$1, ${name}`);
}

export function fallbackAnswer(
  text: string,
  ctx: LeadContext,
  history: { role: "user" | "assistant"; content: string }[] = [],
): { text: string; handoff: boolean; qualify: boolean } {
  const { intent, topic } = detectIntent(text, ctx, history);
  const business = ctx.businessDescription || ctx.businessName;
  const aboutThem = business ? ` For ${business},` : "";

  const situation = detectSituation(text);
  if (situation === "vague_this" && ctx.lastTopic) {
    const label =
      ctx.lastTopic === "ai_assistant"
        ? "assistant"
        : ctx.lastTopic === "whatsapp"
          ? "WhatsApp setup"
          : ctx.lastTopic;
    return {
      text: `Yes, I can help you figure that out. Tell me what you'd like the ${label} to do, or send me an example of what you're referring to.`,
      handoff: false,
      qualify: false,
    };
  }
  if (situation) {
    const next = situationTopic(situation);
    if (next) ctx.lastTopic = next;
    return { text: situationReply(situation), handoff: situationHandoff(situation), qualify: false };
  }

  if (intent === "internship") {
    return { text: unknown("internships"), handoff: false, qualify: false };
  }

  if (intent === "mentorship") {
    return { text: unknown("a mentorship programme"), handoff: false, qualify: false };
  }

  if (intent === "hiring") {
    return { text: unknown("open roles or hiring"), handoff: false, qualify: false };
  }

  if (intent === "training") {
    const teamUse = /\b(my|our|the|your) team\b/.test(text.toLowerCase()) && !/\b(class|course|html|css|react|beginner)\b/.test(text.toLowerCase());
    if (teamUse) {
      return {
        text: `${BUSINESS.handoverTraining}\n\nIf you meant a public coding course, I don't have that as a confirmed offer. Are you asking about using a system we build, or about learning to code?`,
        handoff: false,
        qualify: false,
      };
    }
    return {
      text: "We primarily build websites and digital systems for businesses. I don't have confirmed information about public training, coding classes, or teaching HTML, CSS, React or WordPress. I don't want to give you the wrong information — I can connect you with the team if you're specifically looking to learn.\n\nIf you wanted Zentra to build something for a business instead, I can help with that.",
      handoff: false,
      qualify: false,
    };
  }

  if (intent === "clarify_build") {
    return {
      text: "Absolutely. Do you want Zentra to build that for your business, or are you looking to learn how to build it yourself?",
      handoff: false,
      qualify: false,
    };
  }

  if (intent === "eligibility") {
    const value = text.toLowerCase();
    if (/small budget|don't have (much|plenty) money|low budget/.test(value)) {
      return {
        text: `We work with small businesses as well as larger ones. The lowest confirmed starting point is Starter, from ₦250,000. I don't have a cheaper unofficial package to offer.\n\nWhat are you trying to get done?`,
        handoff: false,
        qualify: false,
      };
    }
    if (/individual(?! business)/.test(value) && !/one-?person|sole/.test(value)) {
      return {
        text: `${BUSINESS.eligibility.individuals}\n\nIs this for a business, even a one-person one?`,
        handoff: false,
        qualify: false,
      };
    }
    if (/established|large compan|big compan/.test(value)) {
      return {
        text: `${BUSINESS.eligibility.established}\n\nWhat kind of system are you looking at?`,
        handoff: false,
        qualify: false,
      };
    }
    if (/don't have a website|no website yet/.test(value)) {
      return {
        text: `${BUSINESS.eligibility.noWebsiteYet}\n\nStarter is the usual place to begin if you need to get found and give people a way to reach you. Want me to explain what that includes?`,
        handoff: false,
        qualify: false,
      };
    }
    return {
      text: `${BUSINESS.whoFor}\n\n${BUSINESS.eligibility.smallAndNew}\n\nWhat's slowing you down — getting found, keeping up with messages, or work the team still does by hand?`,
      handoff: false,
      qualify: false,
    };
  }

  if (intent === "handoff") {
    const askedCall = /\bcall me\b|\bphone (call|me)\b/i.test(text);
    return {
      text: askedCall
        ? "I can get someone from the Zentra team on this WhatsApp chat now — they'll pick it up from here. I don't have a confirmed phone-call process in my notes."
        : "I can get someone from the Zentra team on this chat now — they'll pick it up from here.",
      handoff: true,
      qualify: false,
    };
  }

  if (intent === "complaint") {
    return {
      text: "I'm sorry that's been frustrating. I don't want to argue or keep you going in circles, and I don't have a refund or fix I can apply from here. I can connect you with someone from the team on this chat.",
      handoff: true,
      qualify: false,
    };
  }

  if (intent === "start_project") {
    return {
      text: "Good. I can connect you with the team to talk through scope, timeline and cost before anything is built. I'll take a couple of details so they have context.\n\nWhat should I call you?",
      handoff: false,
      qualify: true,
    };
  }

  if (intent === "founder") {
    return {
      text: `${BUSINESS.founder.known} ${BUSINESS.founder.unknown}`,
      handoff: false,
      qualify: false,
    };
  }

  const capability = detectCapability(text);
  if (capability) {
    ctx.lastTopic = nextTopicFor(capability);
    return { text: capabilityReply(capability), handoff: false, qualify: false };
  }

  if (intent === "business_information" || intent === "services") {
    return {
      text: [
        `${BUSINESS.what}`,
        "In practice that is websites and web apps, WhatsApp and other automation, customer systems, custom software, and marketing systems so enquiries actually get followed up.",
        "What is slowing the business down right now — getting found, keeping up with messages, or the work the team still does by hand?",
      ].join("\n\n"),
      handoff: false,
      qualify: false,
    };
  }

  if (intent === "process" && !topic) {
    return {
      text: [
        BUSINESS.process.headline,
        BUSINESS.process.steps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
        BUSINESS.process.support,
        "What would you like help with?",
      ].join("\n\n"),
      handoff: false,
      qualify: false,
    };
  }

  if (intent === "timeline") {
    return {
      text: "It depends on the work. After a short conversation we give a clear scope, timeline and cost — before anything is built. I don't have a one-size-fits-all number of days.\n\nWhat are you looking to get done?",
      handoff: false,
      qualify: false,
    };
  }

  if (intent === "packages") {
    return {
      text: `Three starting points:\n\n${packagesBlurb()}\n\nWhich feels closest, or tell me the problem you're trying to fix?`,
      handoff: false,
      qualify: false,
    };
  }

  if (intent === "pricing") {
    const focus = topic || ctx.lastTopic;
    if (/cheap|cheapest|lowest/.test(text.toLowerCase())) {
      return {
        text: `The lowest confirmed starting point is *Starter* — ${starterPrice()}. That is a professional website that works on a phone, WhatsApp on the site, and a form so enquiries are not lost. It is a starting price, not a fixed quote for every project.\n\nIs a website what you need, or is it more about messages and follow-up?`,
        handoff: false,
        qualify: false,
      };
    }
    if (focus === "website") {
      return {
        text: `A straightforward website usually starts at *Starter* — ${starterPrice()}. That is a professional site that works on a phone, WhatsApp on the site, and a form so enquiries are not lost. It is a starting price, not a fixed quote for every site.${aboutThem} taking payments on the site would be scoped separately.\n\nIs this a new site, or do you already have one?`,
        handoff: false,
        qualify: false,
      };
    }
    if (focus === "automation" || focus === "whatsapp" || focus === "ai_assistant" || focus === "crm") {
      return {
        text: `When the job is messages, follow-up and less manual work, *Growth* is the usual starting point — ${growthPrice()}. That is a starting price. Custom automation is confirmed after we understand the workflow.\n\nWhat still has to be done by hand every day?`,
        handoff: false,
        qualify: false,
      };
    }
    if (focus === "software") {
      return {
        text: `Custom software is closer to *Scale* — ${scalePrice()}, confirmed after a conversation. We don't quote a single number until we know what the system should do.\n\nWhat should the software actually do for the team?`,
        handoff: false,
        qualify: false,
      };
    }
    return {
      text: `I can share starting points, not a made-up quote.\n\n${packagesBlurb()}\n\nWhich of those is closest, or what are you trying to get built?`,
      handoff: false,
      qualify: false,
    };
  }

  if (intent === "existing_site" || /what about mine/.test(text.toLowerCase())) {
    return {
      text: "Yes — we can work with a site you already have, or rebuild if it isn't doing the job. A lot of people come because the site exists but customers still don't enquire, or messages pile up afterwards.\n\nWhat isn't working about the current one — people can't find you, they don't get in touch, or follow-up is the gap?",
      handoff: false,
      qualify: false,
    };
  }

  if (intent === "website") {
    if (/ecommerce|e-commerce|online store|online shop|shop online/.test(text.toLowerCase()) || /pay|checkout|accept payment|take payment/.test(text.toLowerCase())) {
      return {
        text: `Yes — we can build a site people use to browse and order. ${BUSINESS.ecommerce}\n\nWould customers mainly WhatsApp you after they see the products, or do they need to pay on the site?`,
        handoff: false,
        qualify: false,
      };
    }
    if (/for me$|build a website for me/.test(text.toLowerCase())) {
      return {
        text: withName(
          ctx,
          "Yes. We build websites for businesses so customers can find you, see what you do, and get in touch.\n\nIs this for a business, and do you already have a site?",
        ),
        handoff: false,
        qualify: false,
      };
    }
    return {
      text: withName(ctx, explainService("website")),
      handoff: false,
      qualify: false,
    };
  }

  if (intent === "whatsapp" || intent === "automation" || intent === "ai_assistant") {
    const extra =
      intent === "ai_assistant"
        ? "Yes. We can build an AI assistant around the business that answers questions, explains what you offer, collects enquiries, and hands complex chats to a person. I'm an example of that kind of help.\n\n"
        : intent === "whatsapp"
          ? "Yes. We can automate WhatsApp so customers get a useful first reply, common questions are answered, and enquiries are not lost.\n\n"
          : "";
    return {
      text: extra + explainService("automation"),
      handoff: false,
      qualify: false,
    };
  }

  if (intent === "crm") {
    return { text: explainService("crm"), handoff: false, qualify: false };
  }

  if (intent === "software") {
    return { text: explainService("software"), handoff: false, qualify: false };
  }

  if (intent === "marketing") {
    return { text: explainService("marketing"), handoff: false, qualify: false };
  }

  if (intent === "portfolio") {
    return {
      text: `We help businesses ${BUSINESS.outcomes.map((item) => item.split(" — ")[0].toLowerCase()).join(", ")}.\n\nI don't have a public case-study list in my notes to send you here. If you'd like to see relevant work, I can connect you with the team.\n\nWhat kind of project are you comparing it to?`,
      handoff: false,
      qualify: false,
    };
  }

  if (/payment plan|instalment|installment|pay small/.test(text.toLowerCase())) {
    return { text: unknown("payment plans"), handoff: false, qualify: false };
  }

  if (/abuja|lagos office|office in/.test(text.toLowerCase())) {
    return { text: BUSINESS.location.unknownOffices, handoff: false, qualify: false };
  }

  if (business && /furniture|i run|my business/.test(text.toLowerCase()) && intent === "unknown") {
    return {
      text: `Got it${business ? ` — ${business}` : ""}. If customers need to find you, reach you, or you want WhatsApp and follow-up handled properly, we can help with that.\n\nWhat do you want help with first — the website, messages, or something the team still does by hand?`,
      handoff: false,
      qualify: false,
    };
  }

  const previous = lastAssistantText(history);
  if (previous && /how much\??$/i.test(text.trim())) {
    return fallbackAnswer("how much for that", { ...ctx, lastTopic: ctx.lastTopic || topic }, history);
  }

  return {
    text: unknown("that"),
    handoff: false,
    qualify: false,
  };
}
