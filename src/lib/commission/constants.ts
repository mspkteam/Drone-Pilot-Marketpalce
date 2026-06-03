/** Phase 1 platform commission rate (10%). */
export const DEFAULT_COMMISSION_RATE = 0.1;

export function calculateCommission(amountGross: number, rate = DEFAULT_COMMISSION_RATE) {
  const amount = Math.round(amountGross * rate * 100) / 100;
  const amountNet = Math.round((amountGross - amount) * 100) / 100;
  return { amount, amountNet };
}
