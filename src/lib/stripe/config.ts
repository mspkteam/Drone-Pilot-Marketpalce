import { SERVICE_FEE_RATE } from "@/lib/commission/constants";

export const STRIPE_CURRENCY = "usd" as const;

/** Amounts in cents. */
export const STRIPE_PRICES_CENTS = {
  membership: 9999,
  instructorAddon: 19999,
  backgroundCheck: 2000,
} as const;

/** Client service fee on top of the job amount (6%). */
export const STRIPE_SERVICE_FEE_RATE = SERVICE_FEE_RATE;

/** Days after delivery submission before funds auto-release to the pilot. */
export const AUTO_RELEASE_DAYS = 14;

export type StripeConnectStatus =
  | "not_started"
  | "pending"
  | "complete"
  | "needs_info"
  | "restricted";
