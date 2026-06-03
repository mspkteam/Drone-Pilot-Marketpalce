import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { getPilotProfileByUserId } from "@/lib/pilot/profile";
import {
  getConversationForParticipant,
  markConversationRead,
} from "@/lib/messaging/messaging";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const { id } = await context.params;
  const conversation = await getConversationForParticipant(
    id,
    { pilotProfileId: profile.id },
    authResult.userId,
    "pilot",
  );

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  await markConversationRead(id, authResult.userId, {
    pilotProfileId: profile.id,
  });

  return NextResponse.json({ conversation });
}
