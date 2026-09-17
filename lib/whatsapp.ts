import { site } from "@/content/site";
import type { Package } from "@/content/packages";

export function whatsappHref(text?: string) {
  const url = new URL(`https://wa.me/${site.whatsapp.e164}`);
  if (text?.trim()) url.searchParams.set("text", text.trim());
  return url.toString();
}

export function packageWhatsappHref(item: Package) {
  return whatsappHref(`Hello, I'm interested in the ${item.name} package.`);
}

export function customWhatsappHref(labels: string[]) {
  return whatsappHref(`Hello, I want to build my own solution: ${labels.join(", ")}.`);
}
