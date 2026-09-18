import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { listWebsiteEnquiries, postgresConfigured } from "@/lib/ops/enquiry-postgres";
import { runtimeEnv } from "@/lib/ops/runtime-env";
import { createOpsSession } from "@/lib/ops/session-store";
import { rateLimit } from "@/lib/ops/rate-limit";
import { site } from "@/content/site";
import { getWhatsAppDisplayPhone, normalizeWaPhone } from "@/lib/ops/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE = "zentra_ops";

function envValue(name: string) {
  return runtimeEnv(name);
}

function sameText(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function fail(request: NextRequest, code: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/ops/login";
  url.search = `error=${code}`;
  return NextResponse.redirect(url, 303);
}

function scrub(value: string) {
  return value.replace(/\d+/g, "#").slice(0, 180);
}

export async function GET() {
  const notify = normalizeWaPhone(runtimeEnv("OPS_NOTIFY_PHONE"));
  let from = "";
  try {
    from = await getWhatsAppDisplayPhone();
  } catch {
    from = "";
  }
  const latest = (await listWebsiteEnquiries(1))[0];

  return NextResponse.json({
    passwordReady: envValue("OPS_PASSWORD").length >= 8,
    emailReady: Boolean(envValue("OPS_EMAIL")),
    postgresReady: postgresConfigured(),
    keys: Object.keys(process.env)
      .filter((key) => /^(OPS_|SESSION_|POSTGRES_|DATABASE_)/.test(key))
      .sort(),
    rawPasswordReady: runtimeEnv("OPS_PASSWORD").length >= 8,
    notifyPhoneReady: notify.length >= 10,
    notifyLooksNigerian: notify.startsWith("234"),
    whatsappReady: Boolean(runtimeEnv("WHATSAPP_ACCESS_TOKEN") && runtimeEnv("WHATSAPP_PHONE_NUMBER_ID")),
    graphOk: Boolean(from),
    notifyIsSendingNumber: Boolean(from && (from === notify || from.endsWith(notify) || notify.endsWith(from))),
    notifyIsBusinessLine: notify === normalizeWaPhone(site.whatsapp.e164),
    notifyLast4: notify.slice(-4),
    lastEnquiryPing: latest
      ? {
          sent: Boolean(latest.notifiedAt),
          error: latest.notifyError ? scrub(latest.notifyError) : null,
        }
      : null,
  });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`ops-login:${ip}`, 12, 10 * 60_000)) {
    return fail(request, "1");
  }

  const form = await request.formData();
  const email = String(form.get("email") ?? "").toLowerCase().trim();
  const password = String(form.get("password") ?? "").trim();
  const expectedEmail = (envValue("OPS_EMAIL") || "david@zentra.local").toLowerCase();
  const expectedPassword = envValue("OPS_PASSWORD") || "change-this-password";

  console.info("ops login", {
    hasEmail: Boolean(envValue("OPS_EMAIL")),
    hasPassword: Boolean(expectedPassword),
    passwordLength: expectedPassword.length,
    postgresReady: postgresConfigured(),
  });

  if (email !== expectedEmail || !sameText(password, expectedPassword)) {
    return fail(request, "1");
  }

  let sessionId: string | null = null;
  try {
    sessionId = await createOpsSession();
  } catch (error) {
    console.error("ops login session", error);
    return fail(request, "session");
  }

  if (!sessionId) {
    return fail(request, "session");
  }

  const url = request.nextUrl.clone();
  url.pathname = "/ops";
  url.search = "";
  const response = NextResponse.redirect(url, 303);
  response.cookies.set(COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return response;
}
