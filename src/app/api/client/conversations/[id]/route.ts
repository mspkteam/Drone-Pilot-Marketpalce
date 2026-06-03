import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import { getClientProfileByUserId } from "@/lib/client/profile";
import {
  getConversationForParticipant,
  markConversationRead,
} from "@/lib/messaging/messaging";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireClientSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getClientProfileByUserId(authResult.userId);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const { id } = await context.params;
  const conversation = await getConversationForParticipant(
    id,
    { clientProfileId: profile.id },
    authResult.userId,
    "client",
  );

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  await markConversationRead(id, authResult.userId, {
    clientProfileId: profile.id,
  });

  return NextResponse.json({ conversation });
}
