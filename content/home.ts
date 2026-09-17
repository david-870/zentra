export const home = {
  hero: {
    headline: "Build. Automate. Grow.",
    support: "Websites, software, and automation for your business — small or large.",
    primary: { label: "Get Started", href: "/#contact" },
    secondary: { label: "See packages", href: "/#solutions" },
  },
  packages: {
    eyebrow: "Solutions",
    headline: "Choose the system your business needs.",
    support:
      "Start with the essentials, build for growth, or create a complete technology system around your business.",
  },
  custom: {
    headline: "Build your own solution.",
    body: "Don't need a package? Choose the capabilities your business actually needs and we'll build a solution around your workflow.",
    cta: "Build My Solution",
    note: "We'll help you determine what you actually need before anything is built.",
  },
  process: {
    headline: "How it works",
    steps: [
      { n: "1", title: "Tell us the problem" },
      { n: "2", title: "We plan the work" },
      { n: "3", title: "We build it" },
    ],
  },
  about: {
    line: "We work with small businesses and large companies.",
  },
  work: {
    headline: "What we help with",
  },
  cta: {
    headline: "Tell us what you need.",
    support: "Message us on WhatsApp.",
    button: "Message on WhatsApp",
  },
} as const;
