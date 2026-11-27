import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { isStripeConfigured } from "@/lib/stripe/client";
import {
  createConnectOnboardingLink,
  refreshPilotConnectStatus,
} from "@/lib/stripe/connect";

/** Current payout (Stripe Connect) status. Refreshes from Stripe when an account exists. */
export async function GET() {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json({ configured: false, status: "not_started", accountId: null });
  }
  const state = await refreshPilotConnectStatus(authResult.userId);
  if (!state) {
    return NextResponse.json({ error: "Pilot profile not found." }, { status: 404 });
  }
  return NextResponse.json({
    configured: true,
    status: state.status,
    accountId: state.accountId,
  });
}

/** Create the Express account (if needed) and return a Stripe-hosted onboarding URL. */
export async function POST(request: Request) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }
  try {
    const result = await createConnectOnboardingLink(authResult.userId, request);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ url: result.url });
  } catch (err) {
    console.error("[pilot/payouts/connect]", err);
    return NextResponse.json(
      { error: "Could not start payout setup. Try again shortly." },
      { status: 502 },
    );
  }
}
