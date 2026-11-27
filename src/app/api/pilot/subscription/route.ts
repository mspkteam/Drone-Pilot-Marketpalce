import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import {
  cancelPilotSubscription,
  getCurrentPilotSubscription,
  setPilotMembershipTier,
} from "@/lib/subscriptions/subscription";
import { getPilotProfileByUserId, isOnboardingComplete } from "@/lib/pilot/profile";
import { isStripeConfigured } from "@/lib/stripe/client";
import { createMembershipCheckout } from "@/lib/stripe/checkout";

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

    if (isStripeConfigured()) {
      const checkout = await createMembershipCheckout({
        userId: authResult.userId,
        pilotProfileId: profile.id,
        planId,
        instructorCode: body.instructorCode,
        request,
      });
      if (checkout.ok) {
        return NextResponse.json({ checkoutUrl: checkout.url });
      }
      // Free enrollment (e.g. 100% discount) falls through to direct activation.
      if (!checkout.error.startsWith("Nothing to charge")) {
        return NextResponse.json({ error: checkout.error }, { status: checkout.status });
      }
    }

    const result = await setPilotMembershipTier(profile.id, planId, body.instructorCode);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(
      {
        subscription: result.subscription,
        enrolled: result.enrolled,
        upgradeFeeUsd: result.upgradeFeeUsd,
        membershipDiscountUsd: result.membershipDiscountUsd,
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
