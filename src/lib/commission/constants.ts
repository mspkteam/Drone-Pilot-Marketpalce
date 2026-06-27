/** Default platform commission rate (15% — Paragraph 5 / source PDFs). Super Admin per-pilot override: M309. */
export const DEFAULT_COMMISSION_RATE = 0.15;

export function calculateCommission(amountGross: number, rate = DEFAULT_COMMISSION_RATE) {
  const amount = Math.round(amountGross * rate * 100) / 100;
  const amountNet = Math.round((amountGross - amount) * 100) / 100;
  return { amount, amountNet };
}
