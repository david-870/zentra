export const home = {
  hero: {
    headline: ["Build.", "Automate.", "Grow."],
    support:
      "If customers cannot find you, enquiries pile up, or your team repeats the same tasks every day — that is what we fix.",
    line: "Websites · Automation · CRM · Custom Software",
    primary: { label: "Get Started", href: "/#contact" },
    secondary: { label: "See packages", href: "/#solutions" },
  },
  packages: {
    eyebrow: "Solutions",
    headline: "Choose the system your business is ready for.",
    support:
      "Starter if you need to be found. Growth if enquiries are coming in but follow-up is messy. Scale if you need systems built around how you already work.",
  },
  why: {
    eyebrow: "Who is Zentra",
    headline: "We build practical technology for growing businesses.",
    support:
      "Zentra helps businesses replace disconnected processes with websites, automation and software designed around how their teams actually work.",
    trust: "We don't just build technology. We build systems around your business.",
    points: [
      {
        title: "Built around your business",
        body: "We start from how the work actually happens, then recommend what is practical to build.",
      },
      {
        title: "Easier to run. Built to grow.",
        body: "The system should be something your team can manage — and something the business can grow on.",
      },
    ],
  },
  custom: {
    headline: "Build your own solution.",
    body: "Don't need a package? Choose the capabilities your business actually needs and we'll build a solution around your workflow.",
    cta: "Build My Solution",
    note: "We'll help you determine what you actually need before anything is built.",
  },
  process: {
    eyebrow: "After you contact us",
    headline: "You will know the plan before we build.",
    support: "No vague proposals. You get a scope, a timeline and a cost before development begins.",
    steps: [
      {
        n: "01",
        title: "Tell us what's slowing your business down",
        body: "A short consultation to understand your workflow and goals.",
      },
      {
        n: "02",
        title: "We recommend the right solution",
        body: "You receive a clear scope, timeline and cost before development begins.",
      },
      {
        n: "03",
        title: "We build and test it",
        body: "Your website, automation or software is developed and tested.",
      },
      {
        n: "04",
        title: "We launch and train your team",
        body: "Zentra deploys the system and shows your team how to use it.",
      },
    ],
  },
  work: {
    headline: "What we help with",
    support: "The outcome you want, and what we actually build to get you there.",
  },
  cta: {
    headline: "Tell us what's slowing you down.",
    support:
      "WhatsApp is usually fastest. If you prefer, send a short enquiry — we'll reply with a next step, not a pitch.",
    next: "After you contact us: a short consultation, then a clear scope, timeline and cost before anything is built.",
    button: "Send enquiry",
  },
} as const;
