import { db } from "@/lib/ops/db";

export async function knowledgeBlock() {
  const [items, packs, services] = await Promise.all([
    db.knowledgeBaseItem.findMany(),
    db.package.findMany({ orderBy: { sortOrder: "asc" } }),
    db.service.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const kb = items.map((item) => `${item.title}: ${item.body}`).join("\n");
  const pack = packs
    .map((item) => `${item.name}: ${item.description} ${item.priceLabel}. Includes: ${item.features}.`)
    .join("\n");
  const svc = services.map((item) => `${item.name}: ${item.summary}`).join("\n");

  return `Knowledge base:\n${kb}\n\nPackages:\n${pack}\n\nServices:\n${svc}

Rules:
- Short WhatsApp messages. No long paragraphs.
- Never invent prices, timelines, discounts, guarantees, clients, or results.
- If you do not know, say you don't have that information and offer to connect a human.
- Do not say a package is definitely the one they need. Use "Based on what you've told me".
- Do not show lead scores to customers.`;
}
