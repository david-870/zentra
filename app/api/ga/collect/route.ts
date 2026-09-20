import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function forward(request: NextRequest) {
  const collect = new URL("https://www.google-analytics.com/g/collect");
  request.nextUrl.searchParams.forEach((value, key) => {
    collect.searchParams.set(key, value);
  });

  await fetch(collect, {
    method: "POST",
    headers: {
      "User-Agent": request.headers.get("user-agent") || "Zentra",
    },
    cache: "no-store",
  }).catch(() => undefined);

  return new NextResponse(null, { status: 204 });
}

export async function GET(request: NextRequest) {
  return forward(request);
}

export async function POST(request: NextRequest) {
  return forward(request);
}
