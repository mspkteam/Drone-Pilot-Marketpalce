import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import { processStripeEvent } from "@/lib/stripe/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook. Signature is verified with STRIPE_WEBHOOK_SECRET whenever it is set.
 * Without a secret, unsigned payloads are accepted ONLY in development when the
 * stripe-signature header is absent (local curl/testing).
 */
export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  let event: Stripe.Event;
  if (secret) {
    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature." }, { status: 400 });
    }
    try {
      event = getStripe().webhooks.constructEvent(payload, signature, secret);
    } catch (err) {
      console.error("[stripe/webhook] signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }
  } else if (process.env.NODE_ENV === "development" && !signature) {
    console.warn("[stripe/webhook] STRIPE_WEBHOOK_SECRET unset — skipping verification (dev only).");
    try {
      event = JSON.parse(payload) as Stripe.Event;
    } catch {
      return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 503 });
  }

  try {
    const result = await processStripeEvent(event);
    return NextResponse.json({ received: true, duplicate: result.duplicate });
  } catch (err) {
    console.error("[stripe/webhook] handler error:", event.type, err);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }
}
