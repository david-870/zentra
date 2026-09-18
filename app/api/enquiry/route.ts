import { NextRequest, NextResponse } from "next/server";
import { createWebsiteEnquiry } from "@/lib/ops/enquiry";
import { rateLimit } from "@/lib/ops/rate-limit";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value: string) {
  return value.replace(/\D/g, "").length >= 10;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`enquiry:${ip}`, 8, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many enquiries. Try WhatsApp instead." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid enquiry." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid enquiry." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  if (String(data.company_fax ?? "").trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = String(data.name ?? "").trim();
  const business = String(data.business ?? "").trim();
  const need = String(data.need ?? "").trim();
  const phone = String(data.phone ?? data.contact ?? "").trim();
  const email = String(data.email ?? "").trim();
  const website = String(data.website ?? "").trim();

  if (name.length < 2 || business.length < 2 || need.length < 8 || !isPhone(phone) || !isEmail(email)) {
    return NextResponse.json({ error: "Fill in every required field." }, { status: 400 });
  }

  try {
    await createWebsiteEnquiry({ name, business, need, phone, email, website });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not send the enquiry. Use WhatsApp instead." },
      { status: 503 },
    );
  }
}
