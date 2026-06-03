import { prisma } from "@/lib/db";
import type { AdminPlanDto, AdminSubscriptionRowDto } from "@/types/admin";

export async function listPlansForAdmin(): Promise<AdminPlanDto[]> {
  const plans = await prisma.subscriptionPlan.findMany({
    include: { _count: { select: { subscriptions: true } } },
    orderBy: { priceMonthly: "asc" },
  });

  return plans.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    priceMonthly: p.priceMonthly,
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
      subscriptionPlan: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return subs.map((s) => ({
    id: s.id,
    pilotName: s.pilotProfile.displayName,
    pilotEmail: s.pilotProfile.user.email,
    planName: s.subscriptionPlan.name,
    status: s.status,
    currentPeriodEnd: s.currentPeriodEnd.toISOString(),
  }));
}
