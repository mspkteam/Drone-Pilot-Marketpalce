import { prisma } from "@/lib/db";
import {
  getPricingCodeForTierCode,
  parsePlanFeaturesMeta,
  serializePlanFeaturesMeta,
} from "@/lib/admin/plan-features";
import { toMembershipTierDto } from "@/lib/membership/membership";
import { getRankKeyForTierCode } from "@/lib/membership/rank-assets";
import type {
  AdminPlanDto,
  AdminPlanUpdateInput,
  AdminSubscriptionRowDto,
} from "@/types/admin";

const A_TIER_CODE_PREFIX = /^A\d_/;

function isMembershipTierCode(code: string | null | undefined): boolean {
  return Boolean(code && A_TIER_CODE_PREFIX.test(code));
}

export async function listPlansForAdmin(): Promise<AdminPlanDto[]> {
  const plans = await prisma.subscriptionPlan.findMany({
    include: { _count: { select: { subscriptions: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return plans
    .filter((plan) => isMembershipTierCode(plan.code))
    .map((plan) => {
      const pricingCode = getPricingCodeForTierCode(plan.code ?? "");
      const meta = parsePlanFeaturesMeta(plan.features, pricingCode);
      const rankKey = plan.code ? getRankKeyForTierCode(plan.code) : null;

      return {
        id: plan.id,
        code: plan.code ?? plan.slug,
        pricingCode,
        name: plan.name,
        slug: plan.slug,
        description: meta.description,
        priceYearly: plan.priceYearly,
        priceMonthly: plan.priceMonthly,
        jobVisibilityDelayHours: plan.jobVisibilityDelayHours,
        canViewJobs: plan.canViewJobs,
        canApply: plan.canApply,
        instructorEligible: plan.instructorEligible,
        currency: plan.currency,
        isActive: plan.isActive,
        isRecommended: meta.isRecommended,
        subscriberCount: plan._count.subscriptions,
        displayFeatures: meta.displayFeatures,
        rankKey,
      };
    });
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

export async function updatePlanForAdmin(
  planId: string,
  input: AdminPlanUpdateInput,
): Promise<
  | { ok: true; plan: AdminPlanDto }
  | { ok: false; error: string; status?: number }
> {
  const existing = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
    include: { _count: { select: { subscriptions: true } } },
  });

  if (!existing || !isMembershipTierCode(existing.code)) {
    return { ok: false, error: "Membership tier not found.", status: 404 };
  }

  const pricingCode = getPricingCodeForTierCode(existing.code ?? "");
  const currentMeta = parsePlanFeaturesMeta(existing.features, pricingCode);

  const nextMeta = {
    description: input.description ?? currentMeta.description,
    displayFeatures: input.displayFeatures ?? currentMeta.displayFeatures,
    isRecommended: input.isRecommended ?? currentMeta.isRecommended,
  };

  const priceMonthly =
    input.priceMonthly !== undefined
      ? Math.max(0, Math.round(input.priceMonthly * 100) / 100)
      : existing.priceMonthly;
  const priceYearly = Math.round(priceMonthly * 12 * 100) / 100;

  const updated = await prisma.$transaction(async (tx) => {
    if (nextMeta.isRecommended && pricingCode) {
      const allPlans = await tx.subscriptionPlan.findMany({
        where: { code: { not: null } },
      });
      for (const plan of allPlans) {
        if (plan.id === planId || !isMembershipTierCode(plan.code)) continue;
        const planPricing = getPricingCodeForTierCode(plan.code ?? "");
        const planMeta = parsePlanFeaturesMeta(plan.features, planPricing);
        if (!planMeta.isRecommended) continue;
        await tx.subscriptionPlan.update({
          where: { id: plan.id },
          data: {
            features: serializePlanFeaturesMeta({
              ...planMeta,
              isRecommended: false,
            }),
          },
        });
      }
    }

    return tx.subscriptionPlan.update({
      where: { id: planId },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.priceMonthly !== undefined
          ? { priceMonthly, priceYearly }
          : {}),
        ...(input.jobVisibilityDelayHours !== undefined
          ? { jobVisibilityDelayHours: Math.max(0, input.jobVisibilityDelayHours) }
          : {}),
        ...(input.canViewJobs !== undefined ? { canViewJobs: input.canViewJobs } : {}),
        ...(input.canApply !== undefined ? { canApply: input.canApply } : {}),
        ...(input.instructorEligible !== undefined
          ? { instructorEligible: input.instructorEligible }
          : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        features: serializePlanFeaturesMeta(nextMeta),
      },
      include: { _count: { select: { subscriptions: true } } },
    });
  });

  const meta = parsePlanFeaturesMeta(updated.features, pricingCode);

  return {
    ok: true,
    plan: {
      id: updated.id,
      code: updated.code ?? updated.slug,
      pricingCode,
      name: updated.name,
      slug: updated.slug,
      description: meta.description,
      priceYearly: updated.priceYearly,
      priceMonthly: updated.priceMonthly,
      jobVisibilityDelayHours: updated.jobVisibilityDelayHours,
      canViewJobs: updated.canViewJobs,
      canApply: updated.canApply,
      instructorEligible: updated.instructorEligible,
      currency: updated.currency,
      isActive: updated.isActive,
      isRecommended: meta.isRecommended,
      subscriberCount: updated._count.subscriptions,
      displayFeatures: meta.displayFeatures,
      rankKey: updated.code ? getRankKeyForTierCode(updated.code) : null,
    },
  };
}
