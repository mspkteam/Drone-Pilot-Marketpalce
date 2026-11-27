import { STRIPE_SERVICE_FEE_RATE } from "@/lib/stripe/config";
import type { StripeConnectStatus } from "@/lib/stripe/config";

/** Dollars (float) to integer cents, safe against float drift. */
export function toCents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100);
}

export function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}

export type EscrowAmountsCents = {
  jobCents: number;
  serviceFeeCents: number;
  totalCents: number;
  commissionCents: number;
  pilotNetCents: number;
};

/** Escrow charge = job + 6% service fee; pilot net = job − commission. */
export function computeEscrowAmountsCents(
  jobAmount: number,
  commissionRate: number,
  serviceFeeRate = STRIPE_SERVICE_FEE_RATE,
): EscrowAmountsCents {
  const jobCents = toCents(jobAmount);
  const serviceFeeCents = Math.round(jobCents * serviceFeeRate);
  const commissionCents = Math.round(jobCents * commissionRate);
  return {
    jobCents,
    serviceFeeCents,
    totalCents: jobCents + serviceFeeCents,
    commissionCents,
    pilotNetCents: jobCents - commissionCents,
  };
}

/** Map a Stripe Connect account snapshot to our status enum. */
export function resolveConnectStatus(account: {
  charges_enabled?: boolean | null;
  payouts_enabled?: boolean | null;
  details_submitted?: boolean | null;
  requirements?: {
    currently_due?: string[] | null;
    past_due?: string[] | null;
    disabled_reason?: string | null;
  } | null;
}): StripeConnectStatus {
  const req = account.requirements;
  if (account.payouts_enabled && !req?.past_due?.length) {
    return "complete";
  }
  if (req?.disabled_reason && !req.disabled_reason.startsWith("requirements.")) {
    return "restricted";
  }
  if (req?.past_due?.length) return "restricted";
  if (!account.details_submitted) return "needs_info";
  if (req?.currently_due?.length) return "needs_info";
  return "pending";
}
