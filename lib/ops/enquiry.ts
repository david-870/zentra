import { site } from "@/content/site";
import { opsConfig } from "@/lib/ops/config";
import { db } from "@/lib/ops/db";
import {
  markEnquiryNotified,
  persistWebsiteEnquiryPostgres,
} from "@/lib/ops/enquiry-postgres";
import { notify } from "@/lib/ops/notify";
import { ensureSeed } from "@/lib/ops/seed";
import { sendWhatsAppTemplate, sendWhatsAppText, whatsappConfigured } from "@/lib/ops/whatsapp";

type EnquiryInput = {
  name: string;
  business: string;
  need: string;
  phone: string;
  email: string;
  website?: string;
};

function contactLine(input: EnquiryInput) {
  return [input.phone, input.email, input.website].filter(Boolean).join(" · ");
}

function notifyPhone() {
  return opsConfig.ops.notifyPhone || site.whatsapp.e164;
}

async function persistWebsiteEnquiryLead(input: EnquiryInput) {
  await ensureSeed();
  const digits = input.phone.replace(/\D/g, "");
  const phone = digits.length >= 10 ? digits : input.phone;
  const waId = `web-${input.email.toLowerCase()}`;

  const contact = await db.contact.upsert({
    where: { waId },
    create: { waId, phone, name: input.name },
    update: { name: input.name, phone },
  });

  const lead = await db.lead.create({
    data: {
      contactId: contact.id,
      name: input.name,
      phone,
      businessName: input.business,
      businessDescription: [input.email, input.website].filter(Boolean).join(" · "),
      problem: input.need,
      source: "website",
      status: "NEW",
    },
  });

  await notify({
    type: "lead",
    title: "Website enquiry",
    body: `${input.name} · ${input.business} · ${input.need.slice(0, 160)}`,
    leadId: lead.id,
  });

  return lead;
}

async function notifyOwnerWhatsApp(input: EnquiryInput) {
  if (!whatsappConfigured()) return false;
  const to = notifyPhone();
  if (!to) return false;

  const body = [
    "New website enquiry",
    `Name: ${input.name}`,
    `Business: ${input.business}`,
    `Need: ${input.need}`,
    `Phone: ${input.phone}`,
    `Email: ${input.email}`,
    input.website ? `Website: ${input.website}` : "Website: none",
  ].join("\n");

  try {
    await sendWhatsAppText(to, body);
    return true;
  } catch (error) {
    const template = process.env.WHATSAPP_NOTIFY_TEMPLATE?.trim();
    const language = process.env.WHATSAPP_NOTIFY_TEMPLATE_LANG?.trim() || "en_US";
    if (!template) throw error;
    await sendWhatsAppTemplate(to, template, language, [
      input.name,
      input.business,
      input.need,
      input.phone,
      input.email,
    ]);
    return true;
  }
}

export async function createWebsiteEnquiry(input: EnquiryInput) {
  const errors: unknown[] = [];
  const stored = { ...input, contact: contactLine(input) };
  let neonId: string | null = null;

  try {
    neonId = await persistWebsiteEnquiryPostgres({
      name: input.name,
      business: input.business,
      need: input.need,
      contact: stored.contact,
      phone: input.phone,
      email: input.email,
      website: input.website,
    });
  } catch (error) {
    errors.push(error);
    console.error(error);
  }

  try {
    const lead = await persistWebsiteEnquiryLead(input);
    try {
      await notifyOwnerWhatsApp(input);
      if (neonId) await markEnquiryNotified(neonId);
    } catch (error) {
      console.error(error);
      if (neonId) await markEnquiryNotified(neonId, error instanceof Error ? error.message : "WhatsApp notify failed");
    }
    return lead;
  } catch (error) {
    errors.push(error);
    console.error(error);
  }

  if (neonId) {
    try {
      await notifyOwnerWhatsApp(input);
      await markEnquiryNotified(neonId);
    } catch (error) {
      console.error(error);
      await markEnquiryNotified(neonId, error instanceof Error ? error.message : "WhatsApp notify failed");
    }
    return { id: neonId };
  }

  try {
    if (await notifyOwnerWhatsApp(input)) {
      return { id: "notified" };
    }
  } catch (error) {
    errors.push(error);
    console.error(error);
  }

  throw errors[0] ?? new Error("Could not store the enquiry.");
}
