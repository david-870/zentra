import { opsConfig } from "@/lib/ops/config";
import { db } from "@/lib/ops/db";
import {
  markEnquiryNotified,
  persistWebsiteEnquiryPostgres,
} from "@/lib/ops/enquiry-postgres";
import { notify } from "@/lib/ops/notify";
import { runtimeEnv } from "@/lib/ops/runtime-env";
import { ensureSeed } from "@/lib/ops/seed";
import {
  getWhatsAppDisplayPhone,
  normalizeWaPhone,
  sendWhatsAppTemplate,
  sendWhatsAppText,
  whatsappConfigured,
} from "@/lib/ops/whatsapp";

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
  return opsConfig.ops.notifyPhone;
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
  if (!whatsappConfigured()) {
    throw new Error("WhatsApp Cloud API token is not available to this deployment.");
  }
  const to = normalizeWaPhone(notifyPhone());
  if (!to) {
    throw new Error("OPS_NOTIFY_PHONE is empty. Open it in Vercel, paste your personal WhatsApp, save, then send a new enquiry.");
  }

  const from = await getWhatsAppDisplayPhone();
  if (from && (from === to || from.endsWith(to) || to.endsWith(from))) {
    throw new Error(
      "Cloud API cannot message the same WhatsApp number it sends from. Set OPS_NOTIFY_PHONE to your personal WhatsApp.",
    );
  }

  const body = [
    "New website enquiry",
    `Name: ${input.name}`,
    `Business: ${input.business}`,
    `Need: ${input.need}`,
    `Phone: ${input.phone}`,
    `Email: ${input.email}`,
    input.website ? `Website: ${input.website}` : "Website: none",
  ].join("\n");

  const tail = `ending ${to.slice(-4)}`;
  const template = runtimeEnv("WHATSAPP_NOTIFY_TEMPLATE") || "hello_world";
  const language = runtimeEnv("WHATSAPP_NOTIFY_TEMPLATE_LANG") || "en_US";

  try {
    await sendWhatsAppTemplate(to, template, language, template === "hello_world" ? [] : [
      input.name,
      input.business,
      input.need,
      input.phone,
      input.email,
    ]);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "WhatsApp template failed";
    throw new Error(`${detail} (pinged number ${tail})`);
  }

  try {
    await sendWhatsAppText(to, body);
  } catch {
    // Template already arrived. Text needs a reply in the 24h window.
  }
  return true;
}

async function recordNotify(neonId: string | null, input: EnquiryInput) {
  try {
    await notifyOwnerWhatsApp(input);
    if (neonId) await markEnquiryNotified(neonId);
  } catch (error) {
    console.error(error);
    if (neonId) {
      await markEnquiryNotified(neonId, error instanceof Error ? error.message : "WhatsApp notify failed");
    }
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
    await recordNotify(neonId, input);
    return lead;
  } catch (error) {
    errors.push(error);
    console.error(error);
  }

  if (neonId) {
    await recordNotify(neonId, input);
    return { id: neonId };
  }

  try {
    await notifyOwnerWhatsApp(input);
    return { id: "notified" };
  } catch (error) {
    errors.push(error);
    console.error(error);
  }

  throw errors[0] ?? new Error("Could not store the enquiry.");
}
