import Stripe from "stripe";

let cached: Stripe | null = null;

/** True when a Stripe secret key is present (test or live). */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

/** Server-side Stripe singleton. Throws when STRIPE_SECRET_KEY is missing. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  if (!cached) {
    cached = new Stripe(key, { appInfo: { name: "Remote Air Service" } });
  }
  return cached;
}

/** Public app origin used for Checkout / Account Link return URLs. */
export function getAppBaseUrl(request?: Request): string {
  const env =
    process.env.AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (env) return env.replace(/\/$/, "");
  if (request) return new URL(request.url).origin;
  return "http://localhost:3000";
}
