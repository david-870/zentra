export const SERVICE_GUIDES: Record<
  string,
  {
    title: string;
    answer: string;
  }
> = {
  website: {
    title: "Website / web app",
    answer: [
      "A *website* is the public face of the business. People find you, see what you do, trust you, and know how to reach you. We build it to work well on a phone, with WhatsApp and a form so enquiries don't vanish in chat. We can also put it live for you.",
      "A *web app* is different. It isn't only pages to read — it's something people *use*. Bookings, a client login, a dashboard, orders, or an internal tool in the browser. Same family as a website, closer to software.",
      "If the goal is “customers should find us and contact us,” that's a website. If staff or customers need to log in and run work through it, that's a web app.",
      "Which of those sounds closer — a site to be found, or something people need to use?",
    ].join("\n\n"),
  },
  automation: {
    title: "Automation",
    answer: [
      "Automation is for work the team types again and again.",
      "Typical examples: a customer messages on WhatsApp and gets a useful first reply; common questions are answered; enquiries are saved so they aren't lost; follow-ups go out; bookings or simple requests are routed to the right person. I'm an example of that kind of help.",
      "It doesn't replace the team. It handles the repeatable part so humans handle the real conversations — the quote, the complaint, the unusual request.",
      "It fits when messages pile up, you miss chats after hours, or the same questions come in all day.",
      "What's the repetitive bit for you — messages, follow-up, bookings, or something else?",
    ].join("\n\n"),
  },
  crm: {
    title: "CRM / customers",
    answer: [
      "A CRM is simply a *customer system* — one place for the people who contact you.",
      "Instead of chats, notes, someone's memory and a spreadsheet, the team can see: who it was, what they wanted, whether anyone followed up, and where things stand.",
      "We build one your team can actually run day to day, not a tool nobody opens. It often sits with WhatsApp or the website, so a new enquiry lands in the list automatically.",
      "It fits when leads go cold because nobody owns follow-up, or only one person “knows” the customers.",
      "How do you keep track of people today?",
    ].join("\n\n"),
  },
  software: {
    title: "Custom software",
    answer: [
      "Custom software is for when ready-made tools don't match how you already work.",
      "That might be a system for jobs, stock, approvals, staff or clients — or connecting WhatsApp, records and a dashboard so you're not copying between apps. Sometimes it's a mobile app.",
      "We don't guess the features. We look at the workflow, then build around it. You get a clear scope, timeline and cost before anything is built.",
      "This is closer to Premium — from ₦1,500,000, confirmed after we talk.",
      "What does the team still do by hand that a system should be doing?",
    ].join("\n\n"),
  },
  marketing: {
    title: "Marketing",
    answer: [
      "Marketing here means getting found and turning that into *real enquiries* — not empty traffic.",
      "A nicer Instagram or more ads only help if people land somewhere clear, can reach you, and someone follows up. So this often sits with a proper website, WhatsApp, and a simple way to keep those leads.",
      "We don't promise a number of customers. We set up the path from “they found you” to “you can actually reply.”",
      "Where do most of your customers find you now?",
    ].join("\n\n"),
  },
};

export function explainService(id?: string) {
  const guide = SERVICE_GUIDES[id ?? ""];
  if (!guide) {
    return [
      "Here's what we actually build:",
      "*Website / web app* — a site so customers can find you, or an app they log into and use.",
      "*Automation* — WhatsApp and other repeat work so messages don't pile up.",
      "*CRM / customers* — one place for leads and follow-up, instead of chats and memory.",
      "*Custom software* — a system built around how your team already works.",
      "*Marketing* — getting found and turning that into real enquiries.",
      "Tap one and I'll explain it properly — or tell me what's slowing the business down.",
    ].join("\n\n");
  }
  return guide.answer;
}

export function wantsToContinue(text: string) {
  const value = text.toLowerCase().trim();
  return /\b(that's what i need|thats what i need|that's the one|thats the one|i need (that|this|it)|i want (that|this)|let's (start|go|do it|continue)|lets (start|go|do it)|go ahead|continue|proceed|count me in|for my business)\b/i.test(
    value,
  );
}
