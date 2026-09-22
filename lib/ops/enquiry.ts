import { opsConfig } from "@/lib/ops/config";
import { db } from "@/lib/ops/db";
import {
  markEnquiryEmailNotified,
  persistWebsiteEnquiryPostgres,
} from "@/lib/ops/enquiry-postgres";
import { sendOpsEmail } from "@/lib/ops/email";
import { notify } from "@/lib/ops/notify";
import { ensureSeed } from "@/lib/ops/seed";

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

async function notifyOwnerEmail(input: EnquiryInput, enquiryId: string | null) {
  const origin = opsConfig.appUrl.replace(/\/$/, "");
  const view = enquiryId ? `${origin}/ops/enquiries/${enquiryId}` : `${origin}/ops/enquiries`;
  const text = [
    "NEW ZENTRA ENQUIRY",
    "",
    `Name: ${input.name}`,
    `Business: ${input.business}`,
    `Email: ${input.email}`,
    `WhatsApp: ${input.phone}`,
    `Website: ${input.website || "none"}`,
    `Need: ${input.need}`,
    "",
    `View enquiry: ${view}`,
  ].join("\n");
  await sendOpsEmail("NEW ZENTRA ENQUIRY", text);
}

async function recordNotify(neonId: string | null, input: EnquiryInput) {
  try {
    await notifyOwnerEmail(input, neonId);
    if (neonId) await markEnquiryEmailNotified(neonId);
  } catch (error) {
    console.error(error);
    if (neonId) {
      await markEnquiryEmailNotified(neonId, error instanceof Error ? error.message : "Email notify failed");
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
    await recordNotify(null, input);
    return { id: "notified" };
  } catch (error) {
    errors.push(error);
    console.error(error);
  }

  throw errors[0] ?? new Error("Could not store the enquiry.");
}
