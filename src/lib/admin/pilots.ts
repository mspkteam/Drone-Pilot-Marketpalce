import { prisma } from "@/lib/db";
import { toMembershipTierDto } from "@/lib/membership/membership";
import {
  resolveAnyAdminGradeTierCode,
} from "@/lib/admin/pilot-grades";
import { TIER_CODE_TO_PRICING_PLAN_CODE } from "@/lib/membership/pricing-tier-codes";
import { notifyAsync, sendNotification } from "@/lib/notifications/notify";
import { evaluatePilotAwards } from "@/lib/certificates/certificate";
import type { AdminPilotDto } from "@/types/admin";
import type { PilotProfileStatus } from "@/types/pilot";
import { PILOT_PROFILE_STATUSES } from "@/types/pilot";

export {
  ADMIN_ASSIGNABLE_TIER_CODES,
  HONORARY_GRADE_OPTIONS,
  HONORARY_TIER_CODES,
  canAssignGradeCode,
  isHonoraryGradeCode,
  resolveAdminAssignableTierCode,
  resolveAnyAdminGradeTierCode,
} from "@/lib/admin/pilot-grades";

const ACTIVE_MEMBERSHIP = ["active", "trialing"] as const;

function addYears(date: Date, years: number) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

/**
 * Admin override: set pilot membership grade (A-1…A-6, or A-7…A-10 for Super Admin).
 * Creates an active membership year if none exists.
 */
export async function adminSetPilotGrade(
  pilotProfileId: string,
  tierCodeInput: string,
) {
  const tierCode = resolveAnyAdminGradeTierCode(tierCodeInput);
  if (!tierCode) {
    return {
      ok: false as const,
      error: "Invalid grade. Choose A-1 through A-10.",
      status: 400 as const,
    };
  }

  const profile = await prisma.pilotProfile.findUnique({
    where: { id: pilotProfileId },
    select: { id: true, userId: true, displayName: true },
  });
  if (!profile) {
    return { ok: false as const, error: "Pilot not found.", status: 404 as const };
  }

  let plan = await prisma.subscriptionPlan.findFirst({
    where: { code: tierCode, isActive: true },
  });
  if (!plan) {
    const { seedMembershipTiers } = await import("@/lib/membership/seed-tiers");
    await seedMembershipTiers(prisma);
    plan = await prisma.subscriptionPlan.findFirst({
      where: { code: tierCode, isActive: true },
    });
  }
  if (!plan) {
    return {
      ok: false as const,
      error: "Membership grade plan not found. Seed membership tiers and retry.",
      status: 404 as const,
    };
  }

  const existing = await prisma.pilotSubscription.findFirst({
    where: {
      pilotProfileId,
      status: { in: [...ACTIVE_MEMBERSHIP] },
    },
    include: { subscriptionPlan: true },
    orderBy: { createdAt: "desc" },
  });

  if (existing?.subscriptionPlanId === plan.id) {
    return {
      ok: false as const,
      error: "Pilot is already on this grade.",
      status: 409 as const,
    };
  }

  const previousCode = existing?.subscriptionPlan.code ?? null;
  let subscriptionId: string;

  if (existing) {
    const updated = await prisma.pilotSubscription.update({
      where: { id: existing.id },
      data: { subscriptionPlanId: plan.id },
    });
    subscriptionId = updated.id;
  } else {
    const now = new Date();
    const created = await prisma.pilotSubscription.create({
      data: {
        pilotProfileId,
        subscriptionPlanId: plan.id,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: addYears(now, 1),
        externalSubscriptionId: "admin_manual_grade",
      },
    });
    subscriptionId = created.id;
  }

  await evaluatePilotAwards(pilotProfileId);

  const pricingCode =
    TIER_CODE_TO_PRICING_PLAN_CODE[tierCode] ?? plan.name;

  notifyAsync(async () => {
    await sendNotification({
      userId: profile.userId,
      type: "welcome",
      title: "Membership grade updated",
      body: `Your Remote Air Service grade is now ${plan.name}.`,
      payload: {
        pilotProfileId,
        tierCode,
        previousTierCode: previousCode,
        subscriptionId,
      },
    });
  });

  return {
    ok: true as const,
    tierCode,
    pricingCode,
    tierName: plan.name,
    previousTierCode: previousCode,
    enrolled: !existing,
  };
}

export async function listPilotsForAdmin(
  filter?: PilotProfileStatus | "all",
): Promise<AdminPilotDto[]> {
  const where =
    filter && filter !== "all" ? { status: filter } : undefined;

  const pilots = await prisma.pilotProfile.findMany({
    where,
    include: {
      user: { select: { email: true } },
      subscriptions: {
        where: { status: { in: [...ACTIVE_MEMBERSHIP] } },
        include: { subscriptionPlan: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return pilots.map((p) => {
    const sub = p.subscriptions[0];
    const tier = sub ? toMembershipTierDto(sub.subscriptionPlan) : null;
    return {
      id: p.id,
      userId: p.userId,
      email: p.user.email,
      displayName: p.displayName,
      status: p.status as PilotProfileStatus,
      isPublic: p.isPublic,
      locationCity: p.locationCity,
      locationRegion: p.locationRegion,
      licenseNumber: p.licenseNumber,
      onboardingCompletedAt: p.onboardingCompletedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      membershipTierName: tier?.name ?? null,
      membershipTierCode: tier?.code ?? null,
      membershipStatus: sub?.status ?? null,
      canApply: tier?.canApply ?? null,
      instructorEligible: tier?.instructorEligible ?? null,
      jobVisibilityDelayHours: tier?.jobVisibilityDelayHours ?? null,
    };
  });
}

export async function approvePilotProfile(pilotProfileId: string) {
  const profile = await prisma.pilotProfile.findUnique({
    where: { id: pilotProfileId },
    select: { id: true, status: true, userId: true, displayName: true },
  });

  if (!profile) {
    return { ok: false as const, error: "Pilot not found.", status: 404 };
  }

  if (profile.status !== "pending_review") {
    return {
      ok: false as const,
      error: "Only profiles pending review can be approved.",
      status: 400,
    };
  }

  await prisma.pilotProfile.update({
    where: { id: pilotProfileId },
    data: { status: "approved" },
  });

  notifyAsync(async () => {
    await sendNotification({
      userId: profile.userId,
      type: "welcome",
      title: "Pilot profile approved",
      body: `Your pilot profile (${profile.displayName}) is approved. You can browse jobs and submit bids.`,
      payload: { pilotProfileId },
    });
  });

  await evaluatePilotAwards(pilotProfileId);

  return { ok: true as const };
}

export async function rejectPilotProfile(pilotProfileId: string) {
  const profile = await prisma.pilotProfile.findUnique({
    where: { id: pilotProfileId },
    select: { id: true, status: true, userId: true, displayName: true },
  });

  if (!profile) {
    return { ok: false as const, error: "Pilot not found.", status: 404 };
  }

  if (profile.status !== "pending_review") {
    return {
      ok: false as const,
      error: "Only profiles pending review can be rejected.",
      status: 400,
    };
  }

  await prisma.pilotProfile.update({
    where: { id: pilotProfileId },
    data: { status: "rejected", isPublic: false },
  });

  notifyAsync(async () => {
    await sendNotification({
      userId: profile.userId,
      type: "welcome",
      title: "Pilot profile needs updates",
      body: `Your profile (${profile.displayName}) was not approved. Update your details and resubmit onboarding.`,
      payload: { pilotProfileId },
    });
  });

  return { ok: true as const };
}

export function isValidPilotFilter(
  value: string,
): value is PilotProfileStatus | "all" {
  return value === "all" || PILOT_PROFILE_STATUSES.includes(value as PilotProfileStatus);
}
