import { MEMBERSHIP_TIER_DEFINITIONS } from "@/lib/membership/tiers";
import { TIER_CODE_TO_PRICING_PLAN_CODE } from "@/lib/membership/pricing-tier-codes";

/** Live grades admins may assign manually (A-1 … A-6). */
export const ADMIN_ASSIGNABLE_TIER_CODES = MEMBERSHIP_TIER_DEFINITIONS.map(
  (tier) => tier.code,
) as readonly string[];

/** Honorary grades shown in UI only — invitation later (A-7 … A-10). */
export const HONORARY_GRADE_OPTIONS = [
  { pricingCode: "A-7", title: "Senior Captain" },
  { pricingCode: "A-8", title: "Master Captain" },
  { pricingCode: "A-9", title: "Fleet Captain" },
  { pricingCode: "A-10", title: "Commodore" },
] as const;

const PRICING_CODE_TO_TIER_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(TIER_CODE_TO_PRICING_PLAN_CODE).map(([tierCode, pricing]) => [
    pricing,
    tierCode,
  ]),
);

export function resolveAdminAssignableTierCode(
  input: string,
): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (ADMIN_ASSIGNABLE_TIER_CODES.includes(trimmed)) return trimmed;
  const fromPricing = PRICING_CODE_TO_TIER_CODE[trimmed.toUpperCase()];
  if (fromPricing && ADMIN_ASSIGNABLE_TIER_CODES.includes(fromPricing)) {
    return fromPricing;
  }
  return null;
}
