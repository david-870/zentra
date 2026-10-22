import { GA_ID } from "@/lib/analytics";
import { rateLimit } from "@/lib/ops/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function forward(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (request.headers.get("sec-fetch-site") === "cross-site" || request.nextUrl.search.length > 2048 || !rateLimit(`ga:${ip}`, 60, 60_000)) {
    return new NextResponse(null, { status: 429 });
  }
  if (request.nextUrl.searchParams.get("tid") !== GA_ID || request.nextUrl.searchParams.get("en") !== "page_view") {
    return new NextResponse(null, { status: 400 });
  }
  const collect = new URL("https://www.google-analytics.com/g/collect");
  request.nextUrl.searchParams.forEach((value, key) => {
    collect.searchParams.set(key, value);
  });

  await fetch(collect.toString(), {
    method: "GET",
    headers: {
      "User-Agent": request.headers.get("user-agent") || "Mozilla/5.0",
      Accept: "image/gif,image/*,*/*",
    },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(3000),
  }).catch(() => undefined);

  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: NextRequest) {
  return forward(request);
}

export async function POST(request: NextRequest) {
  return forward(request);
}
