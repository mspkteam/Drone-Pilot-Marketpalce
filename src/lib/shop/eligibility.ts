import { MEMBERSHIP_TIER_RANK } from "@/lib/wings/conditions";

export type ShopEligibilityFields = {
  minTierCode: string | null;
  exactTierCode: string | null;
  requiredWingCode: string | null;
};

export type PilotShopContext = {
  tierCode: string | null;
  wingCodes: Set<string>;
};

export function pilotMeetsProductEligibility(
  product: ShopEligibilityFields,
  pilot: PilotShopContext,
): boolean {
  if (product.exactTierCode) {
    if (!pilot.tierCode || pilot.tierCode !== product.exactTierCode) {
      return false;
    }
  }

  if (product.minTierCode) {
    const required = MEMBERSHIP_TIER_RANK[product.minTierCode] ?? 0;
    const have = pilot.tierCode
      ? (MEMBERSHIP_TIER_RANK[pilot.tierCode] ?? 0)
      : 0;
    if (have < required) return false;
  }

  if (product.requiredWingCode) {
    if (!pilot.wingCodes.has(product.requiredWingCode)) return false;
  }

  return true;
}

export function normalizeTierCode(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim() || null;
  if (!trimmed) return null;
  if (!(trimmed in MEMBERSHIP_TIER_RANK)) return null;
  return trimmed;
}

export function normalizeWingCode(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim() || null;
  return trimmed || null;
}
