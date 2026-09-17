import { NextRequest, NextResponse } from "next/server";
import { opsConfig } from "@/lib/ops/config";
import { runDueFollowUps } from "@/lib/ops/followups";

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!opsConfig.cronSecret || auth !== `Bearer ${opsConfig.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sent = await runDueFollowUps();
  return NextResponse.json({ sent });
}
