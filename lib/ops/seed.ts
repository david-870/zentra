import { packages as publishedPackages, confirmedPackagePrices } from "@/content/packages";
import { hashPassword, verifyPassword } from "@/lib/ops/auth";
import { opsConfig } from "@/lib/ops/config";
import { db } from "@/lib/ops/db";

const packages = publishedPackages.map((item, index) => ({
  id: item.id,
  name: item.name,
  description: item.audience + " " + item.description,
  priceLabel: `${item.priceCaption} ${item.currency}${item.price}. ${item.billing}.`,
  features: item.features.join("; "),
  sortOrder: index + 1,
}));

const services = [
  { id: "website", name: "Website / Web Application", summary: "Sites and web apps people can use.", sortOrder: 1 },
  { id: "automation", name: "AI & Automation", summary: "AI assistants and work that currently happens by hand.", sortOrder: 2 },
  { id: "crm", name: "CRM / Customer Systems", summary: "Keep track of customers, leads, and follow-up.", sortOrder: 3 },
  { id: "software", name: "Custom Software", summary: "Software for how the business actually runs.", sortOrder: 4 },
  { id: "marketing", name: "Marketing & Growth", summary: "Help getting found and converting enquiries.", sortOrder: 5 },
];

const knowledge = [
  {
    key: "company",
    title: "Company",
    body: "Zentra helps businesses get online, keep up with enquiries, and cut repetitive work. We recommend technology based on the actual workflow, and we build systems non-technical teams can use. We work with small businesses and large companies.",
  },
  {
    key: "process",
    title: "Process",
    body: "1) Tell us what's slowing the business down — a short consultation. 2) We recommend the right solution with a clear scope, timeline and cost before development. 3) We build and test it. 4) We launch and train the team. Final package fit is confirmed by the Zentra team.",
  },
  {
    key: "contact",
    title: "Contact",
    body: "WhatsApp 09131918185. People can also send an enquiry from the website. The team can take over any conversation on request.",
  },
  {
    key: "pricing-policy",
    title: "Pricing policy",
    body: `Only quote the published prices: ${confirmedPackagePrices}. Premium package work is capped at ₦800,000 for the agreed features; paid tools, messaging fees, taxes, and extra features are separate. Never invent discounts, timelines, guarantees, or extra prices. If unsure, offer a human handoff.`,
  },
  {
    key: "handoff",
    title: "Human handoff",
    body: "A customer can talk to a human at any time. Do not keep answering after they ask for a person.",
  },
];

export async function ensureSeed() {
  for (const item of packages) {
    await db.package.upsert({
      where: { id: item.id },
      create: item,
      update: {
        name: item.name,
        description: item.description,
        priceLabel: item.priceLabel,
        features: item.features,
        sortOrder: item.sortOrder,
      },
    });
  }

  if ((await db.service.count()) === 0) {
    await db.service.createMany({ data: services });
  }

  for (const item of knowledge) {
    await db.knowledgeBaseItem.upsert({
      where: { key: item.key },
      create: item,
      update: { title: item.title, body: item.body },
    });
  }

  const orphans = await db.conversation.findMany({
    where: { lead: null },
    include: { contact: true },
  });
  for (const conversation of orphans) {
    await db.lead.create({
      data: {
        contactId: conversation.contactId,
        conversationId: conversation.id,
        name: conversation.contact.name,
        phone: conversation.contact.phone,
        source: "whatsapp",
        status: conversation.control === "HUMAN" ? "HUMAN_HANDOFF" : "NEW",
      },
    });
  }

  const email = opsConfig.ops.email.toLowerCase();
  const password = opsConfig.ops.password;
  if (!password) return;

  const user = await db.user.findUnique({ where: { email } });
  const passwordHash = hashPassword(password);
  if (!user) {
    await db.user.create({
      data: { email, name: "David", passwordHash },
    });
    return;
  }
  if (!verifyPassword(password, user.passwordHash)) {
    await db.user.update({ where: { id: user.id }, data: { passwordHash } });
  }
}

export async function safeEnsureSeed() {
  try {
    await ensureSeed();
  } catch (error) {
    console.error("ops seed skipped", error);
  }
}
