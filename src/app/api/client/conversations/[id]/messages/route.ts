import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import { getClientProfileByUserId } from "@/lib/client/profile";
import { sendMessageAsParticipant } from "@/lib/messaging/messaging";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
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

  const body = await request.json();
  const { id } = await context.params;
  const result = await sendMessageAsParticipant(
    id,
    authResult.userId,
    { clientProfileId: profile.id },
    body.body,
    body.attachments,
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ message: result.message }, { status: 201 });
}
