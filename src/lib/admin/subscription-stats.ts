import { prisma } from "@/lib/db";
import { TIER_CODE_TO_PRICING_PLAN_CODE } from "@/lib/membership/pricing-tier-codes";
import type { AdminSubscriptionStatsDto } from "@/types/admin";

const ACTIVE_STATUSES = ["active", "trialing"] as const;

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${Math.round(value / 1_000)}K`;
  }
  return `$${Math.round(value)}`;
}

function tierCodeToNumeric(code: string | null | undefined): number | null {
  if (!code) return null;
  const pricing = TIER_CODE_TO_PRICING_PLAN_CODE[code];
  if (!pricing) return null;
  const match = pricing.match(/A-(\d+)/);
  return match ? Number(match[1]) : null;
}

export async function getSubscriptionStatsForAdmin(): Promise<AdminSubscriptionStatsDto> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [activeSubs, newThisMonth] = await Promise.all([
    prisma.pilotSubscription.findMany({
      where: { status: { in: [...ACTIVE_STATUSES] } },
      include: { subscriptionPlan: true },
    }),
    prisma.pilotSubscription.count({
      where: {
        status: { in: [...ACTIVE_STATUSES] },
        createdAt: { gte: monthStart },
      },
    }),
  ]);

  const activeSubscribers = activeSubs.length;
  const mrr = activeSubs.reduce(
    (sum, sub) => sum + (sub.subscriptionPlan.priceMonthly ?? 0),
    0,
  );

  const tierValues = activeSubs
    .map((sub) => tierCodeToNumeric(sub.subscriptionPlan.code))
    .filter((value): value is number => value !== null);

  const avgTier =
    tierValues.length > 0
      ? `A-${(tierValues.reduce((a, b) => a + b, 0) / tierValues.length).toFixed(1)}`
      : "—";

  return {
    activeSubscribers,
    activeSubscribersSubtext: `+${newThisMonth} this month`,
    monthlyRecurring: formatCurrency(mrr),
    monthlyRecurringSubtext: "from enrolled pilots",
    avgTier,
    avgTierSubtext: "across all pilots",
    churnRate: "2.1%",
    churnRateSubtext: "analytics backend pending",
    usingMockChurn: true,
  };
}
