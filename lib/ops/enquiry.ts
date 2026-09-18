import { site } from "@/content/site";
import { db } from "@/lib/ops/db";
import { persistWebsiteEnquiryPostgres } from "@/lib/ops/enquiry-postgres";
import { notify } from "@/lib/ops/notify";
import { ensureSeed } from "@/lib/ops/seed";
import { sendWhatsAppText, whatsappConfigured } from "@/lib/ops/whatsapp";

function parseContact(value: string) {
  const trimmed = value.trim();
  const email = /@/.test(trimmed) ? trimmed.toLowerCase() : "";
  const digits = trimmed.replace(/\D/g, "");
  const phone = digits.length >= 10 ? digits : "";
  return { email, phone, raw: trimmed };
}

async function persistWebsiteEnquiryLead(input: {
  name: string;
  business: string;
  need: string;
  contact: string;
}) {
  await ensureSeed();
  const parsed = parseContact(input.contact);
  const phone = parsed.phone || "website";
  const waId = `web-${parsed.email || parsed.phone || input.contact.toLowerCase()}`;

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
      businessDescription: parsed.email || parsed.raw,
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

async function notifyOwnerWhatsApp(input: {
  name: string;
  business: string;
  need: string;
  contact: string;
}) {
  if (!whatsappConfigured()) return false;
  const to = process.env.OPS_NOTIFY_PHONE || site.whatsapp.e164;
  if (!to) return false;
  await sendWhatsAppText(
    to,
    [
      "New website enquiry",
      `Name: ${input.name}`,
      `Business: ${input.business}`,
      `Need: ${input.need}`,
      `Contact: ${input.contact}`,
    ].join("\n"),
  );
  return true;
}

export async function createWebsiteEnquiry(input: {
  name: string;
  business: string;
  need: string;
  contact: string;
}) {
  const errors: unknown[] = [];

  try {
    const lead = await persistWebsiteEnquiryLead(input);
    try {
      await notifyOwnerWhatsApp(input);
    } catch (error) {
      console.error(error);
    }
    return lead;
  } catch (error) {
    errors.push(error);
    console.error(error);
  }

  try {
    const id = await persistWebsiteEnquiryPostgres(input);
    if (id) {
      try {
        await notifyOwnerWhatsApp(input);
      } catch (error) {
        console.error(error);
      }
      return { id };
    }
  } catch (error) {
    errors.push(error);
    console.error(error);
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
