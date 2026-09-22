import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { claimEvent, chatStoreReady, releaseEvent } from "@/lib/ops/chat-store";
import { opsConfig } from "@/lib/ops/config";
import { processCustomerText } from "@/lib/ops/engine";
import { rateLimit } from "@/lib/ops/rate-limit";
import { parseIncoming } from "@/lib/ops/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 200_000;

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token")?.trim() ?? "";
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  const expected = (
    opsConfig.whatsapp.verifyToken || String(process.env.WHATSAPP_VERIFY_TOKEN ?? "")
  ).trim();

  if (mode === "subscribe" && challenge && expected && token === expected) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return NextResponse.json({ error: "Invalid verification" }, { status: 403 });
}

function validSignature(request: NextRequest, raw: string) {
  const secret = opsConfig.whatsapp.appSecret;
  if (!secret) {
    return process.env.VERCEL !== "1" && process.env.NODE_ENV !== "production";
  }
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
  if (!rateLimit(`wa:${ip}`, 80, 60_000)) {
    return NextResponse.json({ ok: true, throttled: true });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
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
  if (!incoming) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (!rateLimit(`wa-phone:${incoming.from}`, 25, 60_000)) {
    return NextResponse.json({ ok: true, throttled: true });
  }

  if (!chatStoreReady()) {
    console.error("WhatsApp webhook: Postgres is not configured");
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const claimed = await claimEvent(incoming.id);
  if (!claimed) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  try {
    await processCustomerText({
      waId: incoming.from,
      phone: incoming.from,
      profileName: incoming.name,
      waMessageId: incoming.id,
      text: incoming.text,
    });
  } catch (error) {
    console.error(error);
    await releaseEvent(incoming.id).catch(() => undefined);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
