import { prisma } from "@/lib/db";
import {
  MARKETING_GRADE_PLANS,
  type MarketingGradePlan,
} from "@/lib/marketing/pricing-content";
import { PILOT_ANNUAL_MEMBERSHIP_FEE_USD } from "@/lib/membership/pilot-membership-catalog";
import { TIER_CODE_TO_PRICING_PLAN_CODE } from "@/lib/membership/pricing-tier-codes";
import { parsePlanFeaturesMeta } from "@/lib/admin/plan-features";

function roundUsd(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Public pricing cards: static catalog merged with admin-edited
 * SubscriptionPlan Fast Forward fees / recommended / feature bullets.
 */
export async function getLiveMarketingGradePlans(): Promise<MarketingGradePlan[]> {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true, code: { not: null } },
    orderBy: { sortOrder: "asc" },
  });

  const byPricingCode = new Map<
    string,
    {
      fastForwardFeeUsd: number;
      isRecommended: boolean;
      name: string;
      displayFeatures: string[];
    }
  >();

  for (const plan of plans) {
    if (!plan.code) continue;
    const pricingCode = TIER_CODE_TO_PRICING_PLAN_CODE[plan.code];
    if (!pricingCode || !/^A-[1-6]$/.test(pricingCode)) continue;
    const meta = parsePlanFeaturesMeta(plan.features, pricingCode);
    const fastForwardFeeUsd = Math.max(
      0,
      roundUsd(plan.priceYearly - PILOT_ANNUAL_MEMBERSHIP_FEE_USD),
    );
    byPricingCode.set(pricingCode, {
      fastForwardFeeUsd,
      isRecommended: meta.isRecommended,
      name: plan.name,
      displayFeatures: meta.displayFeatures
        .filter((f) => f.included)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((f) => f.label),
    });
  }

  return MARKETING_GRADE_PLANS.map((base) => {
    const live = byPricingCode.get(base.code);
    if (!live) return base;
    const titleFromName = live.name.replace(/^A-\d+\s+/i, "").trim();
    return {
      ...base,
      title: titleFromName || base.title,
      fastForwardFeeUsd: live.fastForwardFeeUsd,
      isRecommended: live.isRecommended,
      features:
        live.displayFeatures.length > 0
          ? live.displayFeatures.map((label) => ({ label, included: true }))
          : base.features,
    };
  });
}
