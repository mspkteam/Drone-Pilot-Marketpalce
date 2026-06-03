import { prisma } from "@/lib/db";
import { toMembershipTierDto } from "@/lib/membership/membership";
import type { AdminPlanDto, AdminSubscriptionRowDto } from "@/types/admin";

export async function listPlansForAdmin(): Promise<AdminPlanDto[]> {
  const plans = await prisma.subscriptionPlan.findMany({
    include: { _count: { select: { subscriptions: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return plans.map((p) => ({
    id: p.id,
    code: p.code ?? p.slug,
    name: p.name,
    slug: p.slug,
    priceYearly: p.priceYearly,
    priceMonthly: p.priceMonthly,
    jobVisibilityDelayHours: p.jobVisibilityDelayHours,
    canApply: p.canApply,
    instructorEligible: p.instructorEligible,
    currency: p.currency,
    isActive: p.isActive,
    subscriberCount: p._count.subscriptions,
  }));
}

export async function listPilotSubscriptionsForAdmin(): Promise<
  AdminSubscriptionRowDto[]
> {
  const subs = await prisma.pilotSubscription.findMany({
    include: {
      pilotProfile: {
        include: { user: { select: { email: true } } },
      },
      subscriptionPlan: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return subs.map((s) => {
    const tier = toMembershipTierDto(s.subscriptionPlan);
    return {
      id: s.id,
      pilotName: s.pilotProfile.displayName,
      pilotEmail: s.pilotProfile.user.email,
      planName: tier.name,
      tierCode: tier.code,
      status: s.status,
      currentPeriodEnd: s.currentPeriodEnd.toISOString(),
      jobVisibilityDelayHours: tier.jobVisibilityDelayHours,
      canApply: tier.canApply,
      instructorEligible: tier.instructorEligible,
    };
  });
}
