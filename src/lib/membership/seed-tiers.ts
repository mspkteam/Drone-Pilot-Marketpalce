import type { PrismaClient } from "@/generated/prisma/client";
import { MEMBERSHIP_TIER_DEFINITIONS } from "@/lib/membership/tiers";

const LEGACY_SLUGS = ["basic", "pro"];

export async function seedMembershipTiers(prisma: PrismaClient) {
  for (const slug of LEGACY_SLUGS) {
    const legacy = await prisma.subscriptionPlan.findUnique({ where: { slug } });
    if (legacy) {
      await prisma.subscriptionPlan.update({
        where: { id: legacy.id },
        data: {
          code: slug === "basic" ? "LEGACY_BASIC" : "LEGACY_PRO",
          isActive: false,
          priceYearly: 0,
          jobVisibilityDelayHours: 0,
          canViewJobs: false,
          canApply: false,
          instructorEligible: false,
          sortOrder: 99,
        },
      });
    }
  }

  for (const tier of MEMBERSHIP_TIER_DEFINITIONS) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: tier.slug },
      update: {
        name: tier.name,
        slug: tier.slug,
        priceYearly: tier.priceYearly,
        priceMonthly: Math.round((tier.priceYearly / 12) * 100) / 100,
        jobVisibilityDelayHours: tier.jobVisibilityDelayHours,
        canViewJobs: tier.canViewJobs,
        canApply: tier.canApply,
        instructorEligible: tier.instructorEligible,
        sortOrder: tier.sortOrder,
        features: JSON.stringify(tier.features),
        isActive: true,
      },
      create: {
        code: tier.code,
        name: tier.name,
        slug: tier.slug,
        priceYearly: tier.priceYearly,
        priceMonthly: Math.round((tier.priceYearly / 12) * 100) / 100,
        jobVisibilityDelayHours: tier.jobVisibilityDelayHours,
        canViewJobs: tier.canViewJobs,
        canApply: tier.canApply,
        instructorEligible: tier.instructorEligible,
        sortOrder: tier.sortOrder,
        currency: "USD",
        features: JSON.stringify(tier.features),
        isActive: true,
      },
    });
  }
}

export async function enrollPilotInTierCode(
  prisma: PrismaClient,
  pilotProfileId: string,
  tierCode: string,
) {
  const plan = await prisma.subscriptionPlan.findFirst({
    where: { code: tierCode, isActive: true },
  });
  if (!plan) return;

  const active = await prisma.pilotSubscription.findFirst({
    where: {
      pilotProfileId,
      status: { in: ["active", "trialing"] },
    },
  });

  if (active) {
    if (active.subscriptionPlanId === plan.id) return;
    await prisma.pilotSubscription.update({
      where: { id: active.id },
      data: { status: "cancelled" },
    });
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  await prisma.pilotSubscription.create({
    data: {
      pilotProfileId,
      subscriptionPlanId: plan.id,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  });
}
