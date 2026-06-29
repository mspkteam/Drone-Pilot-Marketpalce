import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import {
  cancelPilotSubscription,
  getCurrentPilotSubscription,
  setPilotMembershipTier,
} from "@/lib/subscriptions/subscription";
import { getPilotProfileByUserId, isOnboardingComplete } from "@/lib/pilot/profile";

export async function GET() {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile || !isOnboardingComplete(profile)) {
    return NextResponse.json(
      { error: "Complete pilot onboarding first." },
      { status: 403 },
    );
  }

  const subscription = await getCurrentPilotSubscription(profile.id);
  return NextResponse.json({ subscription });
}

export async function POST(request: Request) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile || !isOnboardingComplete(profile)) {
    return NextResponse.json(
      { error: "Complete pilot onboarding first." },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const planId = body.planId as string | undefined;
    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required." }, { status: 400 });
    }

    const result = await setPilotMembershipTier(profile.id, planId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(
      {
        subscription: result.subscription,
        enrolled: result.enrolled,
        upgradeFeeUsd: result.upgradeFeeUsd,
      },
      { status: result.enrolled ? 201 : 200 },
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}

export async function DELETE() {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile || !isOnboardingComplete(profile)) {
    return NextResponse.json(
      { error: "Complete pilot onboarding first." },
      { status: 403 },
    );
  }

  const result = await cancelPilotSubscription(profile.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ subscription: result.subscription });
}
