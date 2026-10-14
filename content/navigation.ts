import { site } from "@/content/site";
import { whatsappHref } from "@/lib/whatsapp";
export const navLinks = [
  { label: "Packages", href: "/#solutions" },
  { label: "Custom consultation", href: "/#custom" },
  { label: "How it works", href: "/#process" },
] as const;

export const primaryCta = {
  label: "Talk to us",
  href: whatsappHref("Hello Zentra, I would like to discuss what my business needs."),
} as const;

export const footerLinks = [
  { label: "Your privacy", href: "/privacy" },
  { label: "Project details", href: "/terms" },
  { label: "WhatsApp", href: whatsappHref() },
  { label: "Email us", href: `mailto:${site.email}` },
] as const;
