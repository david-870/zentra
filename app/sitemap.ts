import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = site.url.replace(/\/$/, "");
  // Legal pages deliberately use noindex; only include indexable canonical URLs.
  return [{ url: `${origin}/`, changeFrequency: "monthly", priority: 1 }];
}
