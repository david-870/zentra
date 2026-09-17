import { hashPassword, verifyPassword } from "@/lib/ops/auth";
import { opsConfig } from "@/lib/ops/config";
import { db } from "@/lib/ops/db";

const packages = [
  {
    id: "starter",
    name: "Starter",
    description: "A strong digital foundation for small businesses.",
    priceLabel: "Starting from ₦250,000. One-time project.",
    features:
      "Professional landing page; Basic business website setup; Basic AI / automation setup; Lead & contact capture; WhatsApp integration; Mobile responsive design; Deployment",
    sortOrder: 1,
  },
  {
    id: "growth",
    name: "Growth",
    description: "Turn your digital presence into a business system.",
    priceLabel: "Starting from ₦650,000. One-time project.",
    features:
      "Full functional website; AI assistant; WhatsApp OR Instagram automation; Lead capture system; CRM / basic customer management; Business process automation; Analytics & tracking; Deployment & basic training",
    sortOrder: 2,
  },
  {
    id: "scale",
    name: "Scale",
    description: "A fully customized technology system for established businesses.",
    priceLabel: "From ₦1,500,000. Scoped after a conversation.",
    features:
      "High-end custom website / web application; Advanced AI assistant; WhatsApp & Instagram automation; Advanced business automation; CRM / customer management system; Custom integrations; Dashboards & reporting; Custom software where required",
    sortOrder: 3,
  },
];

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
    body: "Zentra helps businesses build better digital systems, automate repetitive work, and grow through technology. We work with small businesses and large companies.",
  },
  {
    key: "process",
    title: "Process",
    body: "1) Tell us the problem. 2) We plan the work. 3) We build it. Final package fit is confirmed by the Zentra team.",
  },
  {
    key: "contact",
    title: "Contact",
    body: "WhatsApp 09131918185. The team can take over any conversation on request.",
  },
  {
    key: "pricing-policy",
    title: "Pricing policy",
    body: "Only quote Starter ₦250,000, Growth ₦650,000, and Scale from ₦1,500,000. Never invent discounts, timelines, guarantees, or extra prices. If unsure, offer a human handoff.",
  },
  {
    key: "handoff",
    title: "Human handoff",
    body: "A customer can talk to a human at any time. Do not keep answering after they ask for a person.",
  },
];

export async function ensureSeed() {
  const existing = await db.package.count();
  if (existing === 0) {
    await db.package.createMany({ data: packages });
    await db.service.createMany({ data: services });
    await db.knowledgeBaseItem.createMany({ data: knowledge });
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
