import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { opsConfig } from "@/lib/ops/config";
import { db } from "@/lib/ops/db";
import { processCustomerText } from "@/lib/ops/engine";
import { rateLimit } from "@/lib/ops/rate-limit";
import { ensureSeed } from "@/lib/ops/seed";
import { parseIncoming } from "@/lib/ops/whatsapp";

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === opsConfig.whatsapp.verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Invalid verification" }, { status: 403 });
}

function validSignature(request: NextRequest, raw: string) {
  const secret = opsConfig.whatsapp.appSecret;
  if (!secret) return true;
  const header = request.headers.get("x-hub-signature-256");
  if (!header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const received = header.slice("sha256=".length);
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`wa:${ip}`, 120, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const raw = await request.text();
  if (!validSignature(request, raw)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const incoming = parseIncoming(payload);
  console.info("WhatsApp webhook POST", {
    parsed: Boolean(incoming),
    from: incoming?.from,
    textPreview: incoming?.text?.slice(0, 40),
  });
  if (!incoming) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    await db.processedEvent.create({ data: { id: incoming.id } });
  } catch {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  try {
    await ensureSeed();
    await processCustomerText({
      waId: incoming.from,
      phone: incoming.from,
      profileName: incoming.name,
      waMessageId: incoming.id,
      text: incoming.text,
    });
  } catch (error) {
    console.error(error);
    await db.processedEvent.delete({ where: { id: incoming.id } }).catch(() => undefined);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
