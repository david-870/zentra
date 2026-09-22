import { hashPassword, verifyPassword } from "@/lib/ops/auth";
import { opsConfig } from "@/lib/ops/config";
import { db } from "@/lib/ops/db";

const packages = [
  {
    id: "starter",
    name: "Starter",
    description: "For businesses establishing their online presence.",
    priceLabel: "Starting from ₦250,000. One-time project.",
    features:
      "A professional website that works on a phone; A simple way for customers to contact you; WhatsApp on your site; A setup that can answer common questions when you are busy; A form so enquiries are not lost; We put the site live for you",
    sortOrder: 1,
  },
  {
    id: "growth",
    name: "Standard",
    description: "For businesses getting enquiries but struggling to manage leads and repetitive tasks.",
    priceLabel: "Starting from ₦650,000. One-time project.",
    features:
      "A full website; WhatsApp or Instagram replies so messages do not pile up; Capture and keep track of leads; A simple customer list; Automate repetitive tasks such as customer enquiries, follow-ups, bookings and lead management; See how people find you; Launch and training for your team",
    sortOrder: 2,
  },
  {
    id: "scale",
    name: "Premium",
    description: "For established businesses that need integrated or custom systems.",
    priceLabel: "From ₦1,500,000. Scoped after a conversation.",
    features:
      "A custom website or web application; WhatsApp and Instagram as part of one system; A customer system your team can run; Automate work across people, chats and spreadsheets; Connect the tools you already use; Dashboards; Custom software where a package is not enough; Launch, handover and training",
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
    body: "Only quote Starter ₦250,000, Standard ₦650,000, and Premium from ₦1,500,000. Never invent discounts, timelines, guarantees, or extra prices. If unsure, offer a human handoff.",
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
