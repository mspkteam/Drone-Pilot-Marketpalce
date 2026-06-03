import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import { getClientProfileByUserId } from "@/lib/client/profile";
import {
  createConversationAsClient,
  listConversationsForClient,
  listEligibleApplicationsForClient,
} from "@/lib/messaging/messaging";

export async function GET() {
  const authResult = await requireClientSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getClientProfileByUserId(authResult.userId);
  if (!profile) {
    return NextResponse.json({ conversations: [], eligibleApplications: [] });
  }

  const [conversations, eligibleApplications] = await Promise.all([
    listConversationsForClient(profile.id, authResult.userId),
    listEligibleApplicationsForClient(profile.id),
  ]);

  return NextResponse.json({ conversations, eligibleApplications });
}

export async function POST(request: Request) {
  const authResult = await requireClientSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getClientProfileByUserId(authResult.userId);
  if (!profile) {
    return NextResponse.json(
      { error: "Complete client onboarding first." },
      { status: 400 },
    );
  }

  const body = (await request.json()) as { jobApplicationId?: string };
  if (!body.jobApplicationId) {
    return NextResponse.json(
      { error: "jobApplicationId is required." },
      { status: 400 },
    );
  }

  const result = await createConversationAsClient(
    profile.id,
    authResult.userId,
    body.jobApplicationId,
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json(
    { conversation: result.conversation },
    { status: 201 },
  );
}
