export type CapabilityId =
  | "payments"
  | "booking"
  | "collect_info"
  | "login_portal"
  | "dashboard"
  | "clone"
  | "web_vs_app"
  | "existing_improve"
  | "mobile_site"
  | "analytics"
  | "crm_connect"
  | "custom_system"
  | "mobile_native"
  | "ai_replace"
  | "ai_realistic"
  | "whatsapp_human"
  | "whatsapp_media"
  | "whatsapp_orders"
  | "wa_on_site"
  | "ads"
  | "social"
  | "branding";

const RULES: { id: CapabilityId; pattern: RegExp }[] = [
  { id: "clone", pattern: /\b(like (uber|jumia|amazon|konga|bolt|airbnb)|clone|exactly like)\b/i },
  { id: "web_vs_app", pattern: /\bdifference between (a )?website and (a )?web app\b/i },
  { id: "payments", pattern: /\b(pay on the (web)?site|sell products|payment gateway|accept payment|take payment|integrate payment|checkout)\b/i },
  { id: "booking", pattern: /\b(book(ing)? (appointments?|system)|appointments?)\b/i },
  { id: "login_portal", pattern: /\b(login|membership|customer portal|client portal|members? area)\b/i },
  { id: "dashboard", pattern: /\b(dashboard|admin (panel|area|dashboard))\b/i },
  { id: "collect_info", pattern: /\b(collect customer (info|information)|enquiry form|contact form|capture (leads|details))\b/i },
  { id: "analytics", pattern: /\b(google analytics|analytics|see (how|where) people)\b/i },
  { id: "crm_connect", pattern: /\b(connect .{0,40}crm|crm to (my )?whatsapp|whatsapp to (my )?crm)\b/i },
  { id: "mobile_site", pattern: /\b(mobile friendly|work on (a )?phone|responsive)\b/i },
  {
    id: "wa_on_site",
    pattern: /\b(whatsapp on (my )?(the )?site|connect (my )?website to whatsapp|website to whatsapp)\b/i,
  },
  {
    id: "existing_improve",
    pattern:
      /\b(redesign|fix my website|website is slow|isn't getting customers|isnt getting customers|improve my website)\b/i,
  },
  { id: "mobile_native", pattern: /\b(android|iphone|ios)\b|\bmobile app\b|\bmobile application\b|\bbuild (an |a )?app\b|app and website together/i },
  {
    id: "custom_system",
    pattern:
      /\b(inventory|employee management|school management|delivery management|internal system|for my employees|specifically for my business|admin dashboard)\b/i,
  },
  { id: "ai_replace", pattern: /\b(replace (my )?(customer service |the )?team|instead of staff|no need for (a )?human)\b/i },
  { id: "whatsapp_human", pattern: /\b(human take over|transfer .{0,30}(staff|human|person|team)|hand( |-)?over)\b/i },
  { id: "whatsapp_media", pattern: /\b(send images?|send photos?|catalogue|product pictures?)\b/i },
  { id: "whatsapp_orders", pattern: /\b(order through whatsapp|whatsapp checkout|buy on whatsapp)\b/i },
  { id: "ads", pattern: /\b(run ads|facebook ads|instagram ads|google ads|manage ads)\b/i },
  { id: "social", pattern: /\b(manage social media|social media manager|post (for me )?on instagram|content calendar)\b/i },
  { id: "branding", pattern: /\b(branding|logo|brand identity)\b/i },
  {
    id: "ai_realistic",
    pattern:
      /\b(ai (chatbot|assistant|bot)|put ai|connect ai|can ai |ai (answer|respond|book|collect|qualify|follow|send|understand|remember|use|work))\b/i,
  },
];

export function detectCapability(text: string): CapabilityId | null {
  const value = text.toLowerCase();
  for (const rule of RULES) {
    if (rule.pattern.test(value)) return rule.id;
  }
  return null;
}

export function capabilityReply(id: CapabilityId): string {
  switch (id) {
    case "payments":
      return `Yes, customers can pay on a site — but that is not in *Starter*. Starter is so people find you and reach you (WhatsApp and a form). A payment gateway or shop checkout is a web app / custom setup, scoped after we talk.\n\nDo you need people to browse and message you, or to pay on the site?`;
    case "booking":
      return `Yes. Appointments can be a simple WhatsApp/request flow, or a real booking system people use in the browser. The second is a web app, not a brochure site.\n\nDo customers mainly message you to book, or should they pick a time themselves?`;
    case "collect_info":
      return `Yes. A form on the site so enquiries are not lost in chat is part of how we usually set a site up — including Starter.\n\nWhat do you want to collect — name and WhatsApp, or more than that?`;
    case "login_portal":
      return `Yes. A login, membership area or customer portal is a *web app* — people use it, they don't just read pages. That is closer to custom work (the Custom package is the starting point, from ₦1,500,000, confirmed after we talk).\n\nWho would log in — customers, staff, or both?`;
    case "dashboard":
      return `Yes. Dashboards are something we build when the team needs to see jobs, orders or leads without chasing chats. That sits with a web app or custom software.\n\nWhat would you want to see on it?`;
    case "clone":
      return `We don't copy another company's whole product. Uber, Jumia or Amazon are huge systems. We can build the *parts your business actually needs* — a catalogue, orders, payments, dispatch, a dashboard — around how you already work.\n\nWhich part matters first for your customers?`;
    case "web_vs_app":
      return `A *website* is pages people read: who you are, what you do, how to reach you. A *web app* is something they *use*: log in, book, pay, see a dashboard, manage orders.\n\nSame family. Different job. Which do you need — get found, or let people work inside the system?`;
    case "existing_improve":
      return `Yes — we can work with a site you already have: make it clearer, faster on a phone, easier to contact you, or rebuild if it isn't doing the job. Getting more customers usually needs a clear site *and* a way to follow up, not only a prettier page.\n\nWhat isn't working today — speed, mobile, contact, or people finding you?`;
    case "mobile_site":
      return `Yes. A site that works well on a phone is a normal part of the work, including Starter.\n\nIs the current one hard to use on a phone, or is this a new site?`;
    case "wa_on_site":
      return `Yes. WhatsApp on the site so enquiries come to your phone is part of Starter.\n\nDo you already have a site, or would this be new?`;
    case "analytics":
      return `Yes. We can set the site up so you can see how people find you and what they do there. Business includes that kind of setup.\n\nDo you already have Google Analytics, or would this be new?`;
    case "crm_connect":
      return `Yes. A customer system can sit with the website or WhatsApp so a new enquiry lands in one list instead of a chat pile. Connecting tools you already use is typical of Custom-level work.\n\nWhat do you use for customers today — WhatsApp, a spreadsheet, or something else?`;
    case "custom_system":
      return `Yes, custom business software is something we can discuss. We don't guess the features — we look at the workflow, then build around it. Starting point is the Custom package, from ₦1,500,000, confirmed after a conversation.\n\nWhat are you currently using to manage that process, and what should the new system actually do?`;
    case "mobile_native":
      return `Yes. We can discuss an Android app, an iPhone app, or both, and a website alongside if you need it. Mobile apps are custom work, scoped after we understand the job. We don't quote a single app price from a template.\n\nWho is the app for — customers, or the team?`;
    case "ai_replace":
      return `No. AI should not replace the customer service team. It can take the repeatable part — first reply, common questions, saving the lead — so humans handle quotes, complaints and anything unusual. I'm an example of that kind of help.\n\nWhere do most of those repeat questions come in — WhatsApp, the website, or both?`;
    case "ai_realistic":
      return `Yes, we can put an AI assistant on WhatsApp, the website, or both. It can answer common questions from your business information, collect enquiries, ask a few qualifying questions, and hand the chat to a person. It can understand casual Nigerian English reasonably well, but it will not be perfect, and it will not remember everything like a human unless we also keep a customer list.\n\nIt should not be promised as flawless or as a full replacement for staff.\n\nWhere do customers usually contact you?`;
    case "whatsapp_human":
      return `Yes. The bot can handle the first reply and common questions, then a person from the team can take over the same chat. That is how we run it.\n\nWho should get those handovers — you, or someone on the team?`;
    case "whatsapp_media":
      return `I don't have confirmed detail that every WhatsApp setup we build can send images or a full catalogue. Text answers about services and products are typical. I can connect you with the team if pictures are a must.\n\nIs the main need answering questions, or showing products?`;
    case "whatsapp_orders":
      return `WhatsApp can take the order details and pass them to the team. A full shop-style checkout inside WhatsApp is custom work, not a Starter add-on.\n\nDo people already message you to order, or do you need payments in the chat too?`;
    case "ads":
      return `I don't have a confirmed “we run your ads” offer in my notes. Marketing here means getting found and turning that into real enquiries — a clear site, WhatsApp, follow-up. Ads only help if that path already works.\n\nIf you want someone to run ad accounts day to day, I can connect you with the team to confirm.\n\nWhere do customers find you now?`;
    case "social":
      return `I don't have confirmed information that we manage social media pages or post content for you. We can automate Instagram *replies* so messages don't pile up — that is different from running the page.\n\nIs the pain posting content, or keeping up with DMs?`;
    case "branding":
      return `I don't have confirmed information about a standalone branding or logo service. We do build the site and systems so the business looks credible online.\n\nIf you need a full brand identity, I can connect you with the team. If you need the website and enquiries sorted, I can help with that.`;
  }
}

export function nextTopicFor(id: CapabilityId) {
  if (id === "payments" || id === "booking" || id === "login_portal" || id === "dashboard" || id === "web_vs_app" || id === "clone") {
    return "website";
  }
  if (id.startsWith("whatsapp") || id === "wa_on_site") return id === "wa_on_site" ? "website" : "whatsapp";
  if (id.startsWith("ai")) return "ai_assistant";
  if (id === "custom_system" || id === "mobile_native") return "software";
  if (id === "crm_connect") return "crm";
  if (id === "ads" || id === "social" || id === "branding") return "marketing";
  return "website";
}
