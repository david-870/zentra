import type { Metadata } from "next";
import { site } from "@/content/site";
import { Hero } from "@/components/sections/Hero";
import { Packages } from "@/components/sections/Packages";
import { Journey } from "@/components/sections/Journey";
export const metadata: Metadata = { alternates: { canonical: "/" } };
const structuredData = {
  "@context": "https://schema.org", "@type": "Organization",
  "@id": `${site.url}/#organization`, name: site.name, url: site.url,
  logo: `${site.url}/brand/zentra-logo.jpeg`, email: site.email,
  description: site.description, telephone: `+${site.whatsapp.e164}`,
  areaServed: { "@type": "Country", name: "Nigeria" },
  knowsAbout: ["Website development", "Mobile app development", "AI assistants", "Business automation", "CRM systems"]
};
export default function HomePage() { return <main id="main"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} /><Hero /><Packages /><Journey /></main>; }
