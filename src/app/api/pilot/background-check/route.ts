import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { getPilotBackgroundCheck } from "@/lib/background-check/service";

export async function GET() {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const check = await getPilotBackgroundCheck(authResult.userId);
  if (!check) {
    return NextResponse.json({ error: "Pilot profile not found." }, { status: 404 });
  }
  return NextResponse.json({ check });
}
