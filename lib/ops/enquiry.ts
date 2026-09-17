import { db } from "@/lib/ops/db";
import { notify } from "@/lib/ops/notify";
import { ensureSeed } from "@/lib/ops/seed";

function parseContact(value: string) {
  const trimmed = value.trim();
  const email = /@/.test(trimmed) ? trimmed.toLowerCase() : "";
  const digits = trimmed.replace(/\D/g, "");
  const phone = digits.length >= 10 ? digits : "";
  return { email, phone, raw: trimmed };
}

export async function createWebsiteEnquiry(input: {
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
