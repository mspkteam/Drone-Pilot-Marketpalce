/** Default platform commission rate (15% — Paragraph 5 / source PDFs). Super Admin per-pilot override applied at payout via getEffectiveCommissionRateForPilot. */
export const DEFAULT_COMMISSION_RATE = 0.15;

/** Client service fee (6%) added on top of the job amount. Estimated/held until Stripe. */
export const SERVICE_FEE_RATE = 0.06;

/** Max cumulative mid-job price increase vs. the original agreed amount (+20%). */
export const MAX_CHANGE_ORDER_INCREASE_RATE = 0.2;

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateCommission(amountGross: number, rate = DEFAULT_COMMISSION_RATE) {
  const amount = Math.round(amountGross * rate * 100) / 100;
  const amountNet = Math.round((amountGross - amount) * 100) / 100;
  return { amount, amountNet };
}

export function calculateServiceFee(jobAmount: number, rate = SERVICE_FEE_RATE) {
  return round2(jobAmount * rate);
}

export type PaymentBreakdownAmounts = {
  jobAmount: number;
  serviceFee: number;
  totalClientPays: number;
  /** Job amount minus platform commission (85% by default or pilot override). */
  pilotNet: number;
  /** Platform commission taken from the job amount. */
  rasCommission: number;
  commissionRate: number;
  serviceFeeRate: number;
};

export function calculatePaymentBreakdown(
  jobAmount: number,
  commissionRate = DEFAULT_COMMISSION_RATE,
  serviceFeeRate = SERVICE_FEE_RATE,
): PaymentBreakdownAmounts {
  const serviceFee = calculateServiceFee(jobAmount, serviceFeeRate);
  const { amount, amountNet } = calculateCommission(jobAmount, commissionRate);
  return {
    jobAmount: round2(jobAmount),
    serviceFee,
    totalClientPays: round2(jobAmount + serviceFee),
    pilotNet: amountNet,
    rasCommission: amount,
    commissionRate,
    serviceFeeRate,
  };
}

/** Highest total job amount allowed given the original amount (+20%). */
export function maxAllowedJobAmount(originalAmount: number) {
  return round2(originalAmount * (1 + MAX_CHANGE_ORDER_INCREASE_RATE));
}

export type ChangeOrderValidation =
  | { ok: true; delta: number; serviceFee: number; clientChargeDelta: number }
  | { ok: false; error: string };

/**
 * Validates a proposed new total job amount against the original (+20% cap).
 * `currentAmount` is the present agreed amount (original + accepted deltas).
 */
export function validateChangeOrderAmount(
  originalAmount: number,
  currentAmount: number,
  proposedAmount: number,
): ChangeOrderValidation {
  if (!Number.isFinite(proposedAmount) || proposedAmount <= 0) {
    return { ok: false, error: "Enter a valid amount." };
  }
  const proposed = round2(proposedAmount);
  if (proposed <= round2(currentAmount)) {
    return { ok: false, error: "Proposed amount must be higher than the current amount." };
  }
  if (proposed > maxAllowedJobAmount(originalAmount)) {
    return {
      ok: false,
      error: `Price increases are limited to +${MAX_CHANGE_ORDER_INCREASE_RATE * 100}% of the original amount (max ${maxAllowedJobAmount(originalAmount)}).`,
    };
  }
  const delta = round2(proposed - currentAmount);
  const serviceFee = calculateServiceFee(delta);
  return { ok: true, delta, serviceFee, clientChargeDelta: round2(delta + serviceFee) };
}
