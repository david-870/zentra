import { foldText } from "@/lib/ops/intent";

export type SituationId =
  | "complaint"
  | "career"
  | "partnership"
  | "work_with_ambiguous"
  | "discount"
  | "attachment"
  | "location"
  | "credibility"
  | "problem_manual"
  | "problem_tracking"
  | "problem_tasks"
  | "problem_search"
  | "problem_afterhours"
  | "problem_pay_online"
  | "vague_this"
  | "free_work"
  | "marketing_agency"
  | "more_leads"
  | "manage_everything"
  | "marketing_price"
  | "existing_stack"
  | "hosting"
  | "maintenance"
  | "monthly"
  | "process_detail"
  | "payment_terms"
  | "problem_booking"
  | "problem_lost_chats"
  | "problem_volume"
  | "problem_faq"
  | "problem_qualify";

const RULES: { id: SituationId; pattern: RegExp }[] = [
  {
    id: "complaint",
    pattern:
      /\b(your website isn'?t working|your system isn'?t working|not happy with (the )?service|problem with my project|nobody has responded|waiting for days|isn'?t what i asked|want a refund|i want a refund|i have a complaint)\b/i,
  },
  {
    id: "career",
    pattern:
      /\b(i['']?m a (developer|student)|i am a (developer|student)|learning coding|freelance for (you|zentra)|join (your|the) team|developer opportunities|learn from your (developers|team)|hire junior|junior developers|developer.{0,40}work with zentra)\b/i,
  },
  {
    id: "partnership",
    pattern:
      /\b(partner with|collaborate|referral (programme|program)|become a reseller|refer clients|my company partner)\b/i,
  },
  {
    id: "work_with_ambiguous",
    pattern: /\b(can i work with zentra|i want to work with (you|zentra)|can we work together|work together on a project)\b/i,
  },
  {
    id: "discount",
    pattern: /\b(discount|promo code|promotional (price|offer)|special offer|coupon)\b/i,
  },
  { id: "attachment", pattern: /^\[attachment\]$/i },
  {
    id: "location",
    pattern:
      /\b(nigerian businesses|work internationally|outside nigeria|work remotely|where are you based|do you have an office|have an office)\b/i,
  },
  {
    id: "credibility",
    pattern:
      /\b(what industries|built something like this|see examples|how experienced|how many developers|how long have you been|who are your clients|case stud)\b/i,
  },
  {
    id: "problem_manual",
    pattern: /\b(doing everything manually|stop my staff from doing|everything by hand)\b/i,
  },
  {
    id: "problem_tracking",
    pattern: /\b(where their orders are|track(ing)? (my |their )?orders|order status)\b/i,
  },
  {
    id: "problem_tasks",
    pattern: /\b(log in and see (their )?tasks|see their tasks|employees need somewhere to log in)\b/i,
  },
  {
    id: "problem_search",
    pattern: /\b(find my business when they search|when they search online|search (for )?(me|my business) online)\b/i,
  },
  {
    id: "problem_afterhours",
    pattern: /\b(when i'?m sleeping|even when i'?m sleeping|after hours|when i'?m not around)\b/i,
  },
  { id: "problem_pay_online", pattern: /\bpay me online\b/i },
  {
    id: "vague_this",
    pattern: /^(can you (do|build|make|automate|integrate) (this|that|it|something like this)\??)$/i,
  },
  {
    id: "free_work",
    pattern: /\b(for free|free website|free consult|free consultation|teach me for free|fix .{0,20}for free)\b/i,
  },
  {
    id: "problem_booking",
    pattern: /\b(book (appointments? )?without calling|without calling me|choose (an )?available time)\b/i,
  },
  {
    id: "problem_lost_chats",
    pattern: /\b(gets lost|get lost|staff .{0,40}whatsapp|send customer information to each other)\b/i,
  },
  {
    id: "problem_volume",
    pattern: /\b(\d+\s+whatsapp messages|too many messages|can't answer them all|cannot answer them all|messages every day)\b/i,
  },
  {
    id: "problem_faq",
    pattern: /\b(same questions|asking (me )?the same|repeat(ed)? questions)\b/i,
  },
  {
    id: "problem_qualify",
    pattern: /\b(which customers are serious|who is serious|serious (leads|customers)|time[- ]wasters)\b/i,
  },
  {
    id: "existing_stack",
    pattern:
      /\b(already have (an? )?(website|developer|shopify|wordpress|crm|whatsapp|app)|already use (shopify|wordpress)|integrate with what i already|work with my existing|migrate my website|take over from another|audit my website|someone else's code|somebody else's code)\b/i,
  },
  {
    id: "hosting",
    pattern: /\b(domain names?|buy a domain|provide hosting|host my website|who owns the domain)\b/i,
  },
  {
    id: "maintenance",
    pattern:
      /\b(maintain my website|update my website|website goes down|technical support|manage the website myself|what happens after you build)\b/i,
  },
  { id: "monthly", pattern: /\b(keep paying every month|monthly (fee|payment|hosting)|pay every month)\b/i },
  {
    id: "payment_terms",
    pattern:
      /\b(how do i pay|require a deposit|deposit|instalments?|installments?|payment plans?|pay in (parts|instal))\b/i,
  },
  {
    id: "process_detail",
    pattern:
      /\b(meeting first|collect requirements|give a proposal|see the design first|how many revisions|request changes|see progress|how do we start|after i contact|what you.?re building|what you are building)\b/i,
  },
  {
    id: "marketing_agency",
    pattern:
      /\b(create content|grow my instagram|tiktok ads|facebook ads|marketing strategy|build my brand)\b/i,
  },
  { id: "manage_everything", pattern: /\b(manage everything|do everything for me|full service agency)\b/i },
  { id: "more_leads", pattern: /\b(more leads|get more (leads|customers)|help my business get more)\b/i },
  { id: "marketing_price", pattern: /\bhow much .{0,20}marketing|marketing cost/i },
];

export function detectSituation(text: string): SituationId | null {
  const value = foldText(text);
  if (/^(joining|join|freelance|partnering)s?[!.]*$/.test(value)) return "career";
  for (const rule of RULES) {
    if (!rule.pattern.test(value)) continue;
    if (rule.id === "work_with_ambiguous" && /\b(developer|student|intern|freelance|join)\b/.test(value)) {
      return "career";
    }
    return rule.id;
  }
  return null;
}

export function situationHandoff(id: SituationId) {
  return id === "complaint" || id === "partnership";
}

export function situationReply(id: SituationId): string {
  switch (id) {
    case "complaint":
      return `I'm sorry that's been frustrating. I don't want to argue or keep you in an automated loop, and I don't have a refund or fix policy I can apply from here.\n\nI'll connect you with someone from the Zentra team on this chat — they'll pick it up from here.`;
    case "career":
      return `We don't have a confirmed jobs board, internship or freelance roster — Zentra's public offer is building systems for businesses.\n\nI can still connect you with someone from the team if you want to ask a person. If you actually need a website or system built, I can help with that.`;
    case "partnership":
      return `That sounds like a partnership or collaboration enquiry. I don't have a confirmed referral programme, reseller offer, or partnership pack in my notes, and I don't want to invent one.\n\nI'll connect you with someone from the team on this chat so they can take it from here.`;
    case "work_with_ambiguous":
      return `Just so I point you the right way — do you want Zentra to build something for a business, or are you asking about joining, freelancing, or partnering with the team?`;
    case "discount":
      return `I don't have any discounts, free services or special offers in my notes, and I can't invent one. The published starting prices are Starter from ₦250,000, Standard from ₦650,000, Complete from ₦1,500,000.\n\nThe team can discuss your requirements and then give the right next step — a clear scope, timeline and cost.\n\nWhat are you looking to get done?`;
    case "attachment":
      return `I can see you sent a file, but I can't inspect images or documents in this chat yet.\n\nTell me what you'd like the system to do, or describe the example you're referring to.`;
    case "location":
      return `We're in Nigeria and we work with businesses here and remotely. I don't have confirmed information about a specific office address, and I don't want to guess.\n\nIf your company is outside Nigeria, the team can confirm that for your case.\n\nAre you asking from Nigeria, or from somewhere else?`;
    case "credibility":
      return `We help businesses get found, capture enquiries, respond faster, manage customers, cut repetitive work, and build custom software. I don't have a published industries list, team size, years in operation, named-client list or case-study pack in my notes — I won't invent those.\n\nIf you want to see relevant work, I can connect you with the team.\n\nWhat kind of project are you comparing it to?`;
    case "problem_manual":
      return `That sounds like business automation — taking repeat work off the team so they aren't doing everything by hand.\n\nI don't want to lock the exact tool yet. What do they currently do manually — messages, orders, follow-up, or something else?`;
    case "problem_tracking":
      return `That sounds like customers need a way to see where their order is — updates on WhatsApp, a tracking page, or a simple dashboard.\n\nI don't want to pick the product too early. How do you tell them the status today?`;
    case "problem_tasks":
      return `That sounds like an internal tool: staff log in and see their tasks, instead of chasing chats. That's a web app / custom software, not a brochure site.\n\nWhat do they use for tasks today — WhatsApp, a spreadsheet, or nothing?`;
    case "problem_search":
      return `That sounds like getting found when people search — usually a clear website, then a way for them to actually contact you. I don't have a confirmed SEO-retainer or ads offer in my notes.\n\nDo people already search for you and land nowhere useful, or is there no site yet?`;
    case "problem_afterhours":
      return `That sounds like WhatsApp or website automation so people still get a useful first reply when you're asleep, then a person takes over later. It shouldn't be promised as a full replacement for you.\n\nWhere do those late messages come in — WhatsApp, Instagram, or the site?`;
    case "problem_pay_online":
      return `That sounds like taking payment on a website — a checkout, not only a brochure. That's a web app / custom setup, not Starter.\n\nDo you already have a site, and should customers pay there or mainly WhatsApp you?`;
    case "vague_this":
      return `Yes, I can help you figure that out. Tell me what you'd like the system to do, or send me an example of what you're referring to.`;
    case "free_work":
      return `We don't build, teach, or fix websites for free, and I don't have a free-consultation offer or any special promo in my notes.\n\nWhat we can do is discuss your requirements: a short conversation to understand the problem, then a clear scope, timeline and cost before anything is built.\n\nIf you'd like to talk through what's slowing the business down, we can start there.`;
    case "marketing_agency":
      return `Zentra is a technology studio. Marketing here means helping people find you and turn that into real enquiries — usually a clear website, WhatsApp, and follow-up. I don't have a confirmed content studio, ads-management, or Instagram-growth offer in my notes.\n\nWe don't guarantee a number of customers, sales or followers.\n\nIf the real issue is that people can't find you, can't reach you, or nobody follows up, that is the technology work we do.\n\nWhat's actually stuck — getting found, or keeping up once they message you?`;
    case "more_leads":
      return `We can help the path that turns interest into real enquiries: a clear site, WhatsApp, and a way to follow up. We do not guarantee a number of leads, customers or sales.\n\nStandard is the usual starting point for that kind of system — from ₦650,000, a one-time project, not a promise of X leads.\n\nWhere do enquiries die today — people don't find you, or they find you and nobody replies?`;
    case "manage_everything":
      return `We don't take over running the whole business. We build the website, automation or software, then launch it and show your team how to use it so you can run it.\n\nWhat do you most want off your plate — the website, the messages, or a system the team uses every day?`;
    case "marketing_price":
      return `There isn't a confirmed ads or content-retainer price in my notes. Zentra's published prices are for technology projects: Starter from ₦250,000, Standard from ₦650,000, Complete from ₦1,500,000 — one-time, starting prices.\n\nIf you mean the system that captures enquiries and follow-up, Standard is the usual starting point. We don't guarantee a number of customers.\n\nAre you asking about ads/content, or about the website and WhatsApp side?`;
    case "existing_stack":
      return `Yes — we don't have to start from zero. We can often work with what you already have, improve it, or connect it. Complete specifically includes connecting the tools you already use.\n\nWhat do you have in place now, and what is the actual problem — it doesn't convert, it doesn't connect, or it's too hard to run?`;
    case "hosting":
      return `We put the site live as part of the project. I don't have confirmed information about selling domain names, a hosting plan, or who legally owns the domain. I don't want to guess on that.\n\nI can connect you with the team for domain and hosting. For the build itself: after a short conversation you get a scope, timeline and cost.\n\nDo you already have a domain?`;
    case "maintenance":
      return `After we build, we launch it and show your team how to use it. The system is meant to be something the team can manage.\n\nI don't have confirmed terms for ongoing monthly maintenance, emergency support if the site goes down, or how many updates are included. I can connect you with the team for that.\n\nIs the question about using the site day to day, or about a support contract after launch?`;
    case "monthly":
      return `The published packages are one-time projects, not a confirmed monthly fee. I don't have a hosting or retainer price in my notes.\n\nIf you need ongoing updates every month, I can connect you with the team rather than invent a subscription.\n\nAre you asking about the build, or about keeping it running afterwards?`;
    case "payment_terms":
      return `I don't have confirmed information about deposits, instalments, or exactly how invoices are paid. I don't want to give you the wrong terms.\n\nWhat I can say: the packages are one-time projects with starting prices, and you get a scope, timeline and cost before anything is built.\n\nI can connect you with the team on payment terms.`;
    case "process_detail":
      return `Here's the part that is confirmed:\n\n1. A short conversation about what's slowing the business down.\n2. You get a clear scope, timeline and cost — before we build. No vague proposals.\n3. We build and test.\n4. We launch and show your team how to use it.\n\nI don't have confirmed detail on how many design revisions you get, or a named project tool for progress. Changes are discussed against the agreed scope.\n\nWhat are you hoping to get built?`;
    case "problem_booking":
      return `That sounds like an online booking system could help. Customers could choose an available time, enter their details, and you wouldn't have to take every request by phone.\n\nThat is a web app, not only a brochure site.\n\nWhat do you use for bookings today — calls, WhatsApp, or a diary?`;
    case "problem_lost_chats":
      return `That sounds like a workflow / customer-system problem. If staff pass details in WhatsApp, things get lost. A CRM or a simple shared list — often connected to WhatsApp — keeps who contacted you, what they wanted, and whether anyone followed up.\n\nHow does a new customer get from the first message to “someone owns this” today?`;
    case "problem_volume":
      return `That sounds like WhatsApp automation could help. An assistant can give a useful first reply, answer the common questions, save the enquiry, and pass the rest to a person so the pile doesn't sit on one phone.\n\nIt doesn't replace the team.\n\nWhat are most of those messages — the same questions, or new orders?`;
    case "problem_faq":
      return `That sounds like an FAQ / AI assistant on WhatsApp or the website. It can answer the repeat questions from your business information and leave the unusual ones for you.\n\nWhich three questions do people ask most?`;
    case "problem_qualify":
      return `That sounds like lead qualification. The assistant can ask a couple of useful questions first — what they need, budget range if they're comfortable, how soon — so the team spends time on people who are ready.\n\nWhat would “serious” look like in your business?`;
  }
}

export function situationTopic(id: SituationId) {
  if (id === "problem_volume" || id === "problem_faq" || id === "problem_afterhours") return "whatsapp";
  if (id === "problem_booking" || id === "problem_search" || id === "problem_pay_online") return "website";
  if (id === "problem_lost_chats" || id === "problem_qualify") return "crm";
  if (id === "problem_manual" || id === "problem_tracking" || id === "problem_tasks") return "software";
  if (id === "marketing_agency" || id === "marketing_price" || id === "more_leads" || id === "manage_everything") {
    return "marketing";
  }
  return undefined;
}
