import {
  PRICING_PLANS,
  type PricingPlanFeature,
} from "@/lib/marketing/pricing-content";
import {
  RECOMMENDED_PRICING_PLAN_CODE,
  TIER_CODE_TO_PRICING_PLAN_CODE,
} from "@/lib/membership/pricing-tier-codes";
import type { MembershipTierDto } from "@/types/membership";

export type PilotSubscriptionPlanCard = {
  id: string;
  tierCode: string;
  pricingCode: string;
  rankKey: "a1" | "a2" | "a3" | "a4" | "a5" | "a6";
  title: string;
  priceMonthly: number;
  currency: string;
  features: PricingPlanFeature[];
  isRecommended: boolean;
};

export function getPricingCodeForTier(tierCode: string): string | null {
  return TIER_CODE_TO_PRICING_PLAN_CODE[tierCode] ?? null;
}

export function getTierMarketingPrices(
  tierCode: string,
  fallback?: { priceMonthly: number; priceYearly: number },
): { priceMonthly: number; priceYearly: number } {
  const pricingCode = getPricingCodeForTier(tierCode);
  const marketing = PRICING_PLANS.find((entry) => entry.code === pricingCode);
  if (marketing) {
    return {
      priceMonthly: marketing.priceMonthly,
      priceYearly: marketing.priceMonthly * 12,
    };
  }
  return {
    priceMonthly: fallback?.priceMonthly ?? 0,
    priceYearly: fallback?.priceYearly ?? 0,
  };
}

function buildFallbackFeatures(plan: MembershipTierDto): PricingPlanFeature[] {
  return [
    {
      label: `Job visibility: ${plan.jobVisibilityDelayHours}h delay`,
      included: true,
    },
    {
      label: plan.canApply ? "Can submit bids" : "View jobs only",
      included: plan.canApply,
    },
    {
      label: plan.instructorEligible ? "Instructor eligible" : "Instructor eligible",
      included: plan.instructorEligible,
    },
    ...plan.features.slice(0, 2).map((feature) => ({
      label: feature,
      included: true,
    })),
  ];
}

function displayFeaturesFromPlan(
  plan: MembershipTierDto,
  marketing: (typeof PRICING_PLANS)[number] | undefined,
): PricingPlanFeature[] {
  if (plan.displayFeatures?.length) {
    return plan.displayFeatures;
  }
  return marketing?.features ?? buildFallbackFeatures(plan);
}

export function mapTierToSubscriptionCard(
  plan: MembershipTierDto,
): PilotSubscriptionPlanCard {
  const pricingCode = getPricingCodeForTier(plan.code) ?? plan.code;
  const marketing = PRICING_PLANS.find((entry) => entry.code === pricingCode);

  return {
    id: plan.id,
    tierCode: plan.code,
    pricingCode,
    rankKey: marketing?.rankKey ?? "a1",
    title: plan.name,
    priceMonthly: plan.priceMonthly,
    currency: plan.currency,
    features: displayFeaturesFromPlan(plan, marketing),
    isRecommended: plan.isRecommended ?? false,
  };
}

export function isRecommendedPlan(
  pricingCode: string,
  currentPricingCode: string | null,
  planIsRecommended?: boolean,
): boolean {
  if (currentPricingCode === pricingCode) return false;
  if (planIsRecommended) return true;
  return pricingCode === RECOMMENDED_PRICING_PLAN_CODE;
}
