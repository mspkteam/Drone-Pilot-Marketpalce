import { homeAssets } from "@/lib/marketing/home-assets";
import { TIER_CODE_TO_PRICING_PLAN_CODE } from "@/lib/marketing/pricing-pilot-context";

export type RankAssetKey = keyof typeof homeAssets.ranks;

const TIER_CODE_TO_RANK_KEY: Record<string, RankAssetKey> = {
  A1_STUDENT: "a1",
  A2_JUNIOR_FLIGHT_OFFICER: "a2",
  A3_FLIGHT_OFFICER: "a3",
  A4_SENIOR_FLIGHT_OFFICER: "a4",
  A5_FIRST_OFFICER: "a5",
  A6_CAPTAIN: "a6",
};

export function getRankKeyForTierCode(tierCode: string): RankAssetKey | null {
  return TIER_CODE_TO_RANK_KEY[tierCode] ?? null;
}

export function getRankImageForTierCode(tierCode: string): string | null {
  const key = getRankKeyForTierCode(tierCode);
  return key ? homeAssets.ranks[key] : null;
}

export function getDisplayCodeForTier(tierCode: string): string {
  return TIER_CODE_TO_PRICING_PLAN_CODE[tierCode] ?? tierCode;
}
