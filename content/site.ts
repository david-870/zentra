export const site = {
  name: "Zentra",
  tagline: "Build. Automate. Grow.",
  description:
    "We build websites, software, and automation for small businesses and large companies.",
  whatsapp: {
    display: "09131918185",
    e164: "2349131918185",
  },
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  social: {
    linkedin: "https://www.linkedin.com/",
    instagram: "https://www.instagram.com/",
    x: "https://x.com/",
  },
} as const;
