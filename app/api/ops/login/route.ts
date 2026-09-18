import { NextRequest, NextResponse } from "next/server";
import { sameText } from "@/lib/ops/auth";
import { createOpsSession } from "@/lib/ops/session-store";
import { rateLimit } from "@/lib/ops/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE = "zentra_ops";

function envValue(name: string) {
  for (const [key, value] of Object.entries(process.env)) {
    if (key !== name) continue;
    if (typeof value !== "string") return "";
    return value.trim().replace(/^(['"])(.*)\1$/, "$2").trim();
  }
  return "";
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`ops-login:${ip}`, 12, 10 * 60_000)) {
    const url = request.nextUrl.clone();
    url.pathname = "/ops/login";
    url.search = "error=1";
    return NextResponse.redirect(url, 303);
  }

  const form = await request.formData();
  const email = String(form.get("email") ?? "").toLowerCase().trim();
  const password = String(form.get("password") ?? "").trim();
  const expectedEmail = (envValue("OPS_EMAIL") || "david@zentra.local").toLowerCase();
  const expectedPassword = envValue("OPS_PASSWORD");

  console.info("ops login", {
    hasEmail: Boolean(envValue("OPS_EMAIL")),
    hasPassword: Boolean(expectedPassword),
    passwordLength: expectedPassword.length,
  });

  if (!expectedPassword || email !== expectedEmail || !sameText(password, expectedPassword)) {
    const url = request.nextUrl.clone();
    url.pathname = "/ops/login";
    url.search = "error=1";
    return NextResponse.redirect(url, 303);
  }

  const sessionId = await createOpsSession();
  if (!sessionId) {
    console.error("ops login: could not store session");
    const url = request.nextUrl.clone();
    url.pathname = "/ops/login";
    url.search = "error=1";
    return NextResponse.redirect(url, 303);
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
