import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { listPaymentsForPilotUser } from "@/lib/payments/payment";
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

  const payments = await listPaymentsForPilotUser(authResult.userId);
  return NextResponse.json({ payments });
}
