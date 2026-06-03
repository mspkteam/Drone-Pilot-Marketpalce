import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { getPilotProfileByUserId } from "@/lib/pilot/profile";
import { listConversationsForPilot } from "@/lib/messaging/messaging";

export async function GET() {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile) {
    return NextResponse.json({ conversations: [] });
  }

  const conversations = await listConversationsForPilot(
    profile.id,
    authResult.userId,
  );

  return NextResponse.json({ conversations });
}
