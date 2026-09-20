import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function forward(request: NextRequest) {
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
    redirect: "follow",
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
