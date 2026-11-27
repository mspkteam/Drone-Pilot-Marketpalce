import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import { requireOnboardedClient } from "@/lib/client/require-onboarded";
import { isStripeConfigured } from "@/lib/stripe/client";
import {
  createClientSetupCheckout,
  detachClientPaymentMethod,
  listClientPaymentMethods,
} from "@/lib/stripe/checkout";

async function authorize() {
  const authResult = await requireClientSession();
  if (!authResult.ok) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: authResult.error }, { status: authResult.status }),
    };
  }
  const onboarded = await requireOnboardedClient(authResult.userId);
  if (!onboarded.ok) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: onboarded.error }, { status: 403 }),
    };
  }
  return { ok: true as const, userId: authResult.userId };
}

export async function GET() {
  const auth = await authorize();
  if (!auth.ok) return auth.response;
  if (!isStripeConfigured()) {
    return NextResponse.json({ configured: false, methods: [] });
  }
  try {
    const methods = await listClientPaymentMethods(auth.userId);
    return NextResponse.json({ configured: true, methods });
  } catch (err) {
    console.error("[client/billing/payment-methods]", err);
    return NextResponse.json({ error: "Could not load payment methods." }, { status: 502 });
  }
}

/** Start a Stripe setup-mode Checkout to save a card. */
export async function POST(request: Request) {
  const auth = await authorize();
  if (!auth.ok) return auth.response;
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }
  try {
    const result = await createClientSetupCheckout({ userId: auth.userId, request });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ checkoutUrl: result.url });
  } catch (err) {
    console.error("[client/billing/payment-methods]", err);
    return NextResponse.json({ error: "Could not start card setup." }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  const auth = await authorize();
  if (!auth.ok) return auth.response;
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Payment method id required." }, { status: 400 });
  try {
    const ok = await detachClientPaymentMethod(auth.userId, id);
    if (!ok) return NextResponse.json({ error: "Payment method not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[client/billing/payment-methods]", err);
    return NextResponse.json({ error: "Could not remove card." }, { status: 502 });
  }
}
