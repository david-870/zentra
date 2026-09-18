import { site } from "@/content/site";
import { db } from "@/lib/ops/db";
import { persistWebsiteEnquiryPostgres } from "@/lib/ops/enquiry-postgres";
import { notify } from "@/lib/ops/notify";
import { ensureSeed } from "@/lib/ops/seed";
import { sendWhatsAppText, whatsappConfigured } from "@/lib/ops/whatsapp";

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
  const to = process.env.OPS_NOTIFY_PHONE || site.whatsapp.e164;
  if (!to) return false;
  await sendWhatsAppText(
    to,
    [
      "New website enquiry",
      `Name: ${input.name}`,
      `Business: ${input.business}`,
      `Need: ${input.need}`,
      `Phone: ${input.phone}`,
      `Email: ${input.email}`,
      input.website ? `Website: ${input.website}` : "Website: none",
    ].join("\n"),
  );
  return true;
}

export async function createWebsiteEnquiry(input: EnquiryInput) {
  const errors: unknown[] = [];
  const stored = { ...input, contact: contactLine(input) };

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
    const id = await persistWebsiteEnquiryPostgres({
      name: input.name,
      business: input.business,
      need: input.need,
      contact: stored.contact,
    });
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
