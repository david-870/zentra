import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { runtimeEnv } from "@/lib/ops/runtime-env";
import { createOpsSession } from "@/lib/ops/session-store";
import { loginRateLimit } from "@/lib/security/login-rate-limit";
import { sameOrigin, readLimitedBody } from "@/lib/security/request";



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

export async function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  try {
    if (!(await loginRateLimit(ip))) return fail(request, "1");
  } catch {
    return fail(request, "session");
  }
  let form: URLSearchParams;
  try {
    if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) {
      return new NextResponse(null, { status: 415 });
    }
    form = new URLSearchParams(await readLimitedBody(request, 4096));
  } catch { return fail(request, "1"); }
  const email = String(form.get("email") ?? "").toLowerCase().trim();
  const password = String(form.get("password") ?? "").trim();
  const expectedEmail = (envValue("OPS_EMAIL") || "david@zentra.local").toLowerCase();
  const expectedPassword = envValue("OPS_PASSWORD");

  if (expectedPassword.length < 12 || expectedPassword === "change-this-password") {
    return fail(request, "env");
  }

  if (email !== expectedEmail || !sameText(password, expectedPassword)) {
    return fail(request, "1");
  }

  let sessionId: string | null = null;
  try {
    sessionId = await createOpsSession();
  } catch (error) {
    console.error("Ops session creation failed");
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
