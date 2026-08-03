import {
  HONORARY_MEMBERSHIP_TIER_DEFINITIONS,
  LIVE_MEMBERSHIP_TIER_DEFINITIONS,
} from "@/lib/membership/tiers";
import { TIER_CODE_TO_PRICING_PLAN_CODE } from "@/lib/membership/pricing-tier-codes";
import type { UserRole } from "@/types/roles";

/** Live grades staff with users.edit may assign (A-1 … A-6). */
export const ADMIN_ASSIGNABLE_TIER_CODES = LIVE_MEMBERSHIP_TIER_DEFINITIONS.map(
  (tier) => tier.code,
) as readonly string[];

/** Honorary grades — Super Admin invitation only (A-7 … A-10). */
export const HONORARY_TIER_CODES = HONORARY_MEMBERSHIP_TIER_DEFINITIONS.map(
  (tier) => tier.code,
) as readonly string[];

export const HONORARY_GRADE_OPTIONS = HONORARY_MEMBERSHIP_TIER_DEFINITIONS.map(
  (tier) => ({
    pricingCode: TIER_CODE_TO_PRICING_PLAN_CODE[tier.code] ?? tier.code,
    tierCode: tier.code,
    title: tier.name.replace(/^A-\d+\s+/, ""),
  }),
) as readonly {
  pricingCode: string;
  tierCode: string;
  title: string;
}[];

const PRICING_CODE_TO_TIER_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(TIER_CODE_TO_PRICING_PLAN_CODE).map(([tierCode, pricing]) => [
    pricing,
    tierCode,
  ]),
);

function normalizeTierInput(input: string): string {
  return input.trim();
}

export function isHonoraryGradeCode(tierCode: string): boolean {
  return HONORARY_TIER_CODES.includes(tierCode);
}

export function isLiveAssignableGradeCode(tierCode: string): boolean {
  return ADMIN_ASSIGNABLE_TIER_CODES.includes(tierCode);
}

/** Resolve A-1…A-6 codes for general admin grade assignment. */
export function resolveAdminAssignableTierCode(
  input: string,
): string | null {
  const trimmed = normalizeTierInput(input);
  if (!trimmed) return null;
  if (ADMIN_ASSIGNABLE_TIER_CODES.includes(trimmed)) return trimmed;
  const fromPricing = PRICING_CODE_TO_TIER_CODE[trimmed.toUpperCase()];
  if (fromPricing && ADMIN_ASSIGNABLE_TIER_CODES.includes(fromPricing)) {
    return fromPricing;
  }
  return null;
}

/** Resolve A-1…A-10 (live + honorary) tier codes. */
export function resolveAnyAdminGradeTierCode(input: string): string | null {
  const trimmed = normalizeTierInput(input);
  if (!trimmed) return null;
  if (
    ADMIN_ASSIGNABLE_TIER_CODES.includes(trimmed) ||
    HONORARY_TIER_CODES.includes(trimmed)
  ) {
    return trimmed;
  }
  const fromPricing = PRICING_CODE_TO_TIER_CODE[trimmed.toUpperCase()];
  if (
    fromPricing &&
    (ADMIN_ASSIGNABLE_TIER_CODES.includes(fromPricing) ||
      HONORARY_TIER_CODES.includes(fromPricing))
  ) {
    return fromPricing;
  }
  return null;
}

/**
 * A-1–A-6: any role with users.edit.
 * A-7–A-10: Super Admin only.
 */
export function canAssignGradeCode(
  role: UserRole | string | null | undefined,
  tierCode: string,
): boolean {
  if (isLiveAssignableGradeCode(tierCode)) return true;
  if (isHonoraryGradeCode(tierCode)) return role === "super_admin";
  return false;
}
