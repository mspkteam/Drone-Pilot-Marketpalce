import { evaluatePilotAwards } from "@/lib/certificates/awards";
import { syncInstructorAddonWithMembership } from "@/lib/membership/instructor-addon";
import { getFastForwardFeeUsd, PILOT_ANNUAL_MEMBERSHIP_FEE_USD } from "@/lib/membership/pilot-membership-catalog";
import { applyInstructorDiscountCode } from "@/lib/instructor/discount";
import { instructorMembershipDiscountUsd } from "@/lib/instructor/constants";
import { toMembershipTierDto } from "@/lib/membership/membership";
import { prisma } from "@/lib/db";
import type {
  PilotSubscriptionDto,
  SubscriptionStatus,
} from "@/types/subscription";
import type { MembershipTierDto } from "@/types/membership";
import type { PilotSubscription, SubscriptionPlan } from "@/generated/prisma/client";

const ACTIVE_STATUSES = ["trialing", "active"] as const;

export function toPlanDto(plan: SubscriptionPlan): MembershipTierDto {
  return toMembershipTierDto(plan);
}

export function toSubscriptionDto(
  sub: PilotSubscription & { subscriptionPlan: SubscriptionPlan },
): PilotSubscriptionDto {
  return {
    id: sub.id,
    pilotProfileId: sub.pilotProfileId,
    subscriptionPlanId: sub.subscriptionPlanId,
    status: sub.status as SubscriptionStatus,
    currentPeriodStart: sub.currentPeriodStart.toISOString(),
    currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
    externalSubscriptionId: sub.externalSubscriptionId,
    instructorDiscountCode: sub.instructorDiscountCode,
    instructorDiscountUsd: sub.instructorDiscountUsd,
    createdAt: sub.createdAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
    plan: toPlanDto(sub.subscriptionPlan),
  };
}

export async function listActivePlans(): Promise<MembershipTierDto[]> {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return plans.map(toPlanDto);
}

export async function getCurrentPilotSubscription(pilotProfileId: string) {
  const sub = await prisma.pilotSubscription.findFirst({
    where: {
      pilotProfileId,
      status: { in: [...ACTIVE_STATUSES] },
    },
    include: { subscriptionPlan: true },
    orderBy: { createdAt: "desc" },
  });
  return sub ? toSubscriptionDto(sub) : null;
}

function addYears(date: Date, years: number) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

export type SetPilotMembershipResult =
  | {
      ok: true;
      subscription: PilotSubscriptionDto;
      enrolled: boolean;
      upgradeFeeUsd: number;
      membershipDiscountUsd: number;
    }
  | { ok: false; error: string; status: 404 | 409 };

export async function setPilotMembershipTier(
  pilotProfileId: string,
  planId: string,
  instructorCode?: string | null,
): Promise<SetPilotMembershipResult> {
  const plan = await prisma.subscriptionPlan.findFirst({
    where: { id: planId, isActive: true },
  });

  if (!plan) {
    return { ok: false, error: "Membership tier not found.", status: 404 };
  }

  const existing = await prisma.pilotSubscription.findFirst({
    where: {
      pilotProfileId,
      status: { in: [...ACTIVE_STATUSES] },
    },
    include: { subscriptionPlan: true },
  });

  if (!existing) {
    const now = new Date();
    const periodEnd = addYears(now, 1);
    let membershipDiscountUsd = 0;
    let appliedCode: string | null = null;

    if (instructorCode?.trim()) {
      const applied = await applyInstructorDiscountCode(
        pilotProfileId,
        instructorCode,
      );
      if (applied.ok) {
        membershipDiscountUsd = applied.discountUsd;
        appliedCode = applied.code;
      }
    } else {
      const linked = await prisma.pilotProfile.findUnique({
        where: { id: pilotProfileId },
        select: {
          referredByInstructor: {
            select: {
              instructorAddonActive: true,
              instructorDiscountCode: true,
            },
          },
        },
      });
      if (linked?.referredByInstructor?.instructorAddonActive) {
        membershipDiscountUsd = instructorMembershipDiscountUsd(
          PILOT_ANNUAL_MEMBERSHIP_FEE_USD,
        );
        appliedCode = linked.referredByInstructor.instructorDiscountCode;
      }
    }

    const sub = await prisma.pilotSubscription.create({
      data: {
        pilotProfileId,
        subscriptionPlanId: plan.id,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        externalSubscriptionId: "demo_internal",
        instructorDiscountCode: appliedCode,
        instructorDiscountUsd: membershipDiscountUsd,
      },
      include: { subscriptionPlan: true },
    });

    await evaluatePilotAwards(pilotProfileId);

    return {
      ok: true,
      subscription: toSubscriptionDto(sub),
      enrolled: true,
      upgradeFeeUsd: getFastForwardFeeUsd(plan.code ?? ""),
      membershipDiscountUsd,
    };
  }

  if (existing.subscriptionPlanId === plan.id) {
    return {
      ok: false,
      error: "You are already on this membership grade.",
      status: 409,
    };
  }

  if (plan.sortOrder <= existing.subscriptionPlan.sortOrder) {
    return {
      ok: false,
      error: "Fast Forward upgrades must move to a higher grade.",
      status: 409,
    };
  }

  const upgradeFeeUsd =
    getFastForwardFeeUsd(plan.code ?? "") -
    getFastForwardFeeUsd(existing.subscriptionPlan.code ?? "");

  const updated = await prisma.pilotSubscription.update({
    where: { id: existing.id },
    data: { subscriptionPlanId: plan.id },
    include: { subscriptionPlan: true },
  });

  if (instructorCode?.trim()) {
    await applyInstructorDiscountCode(pilotProfileId, instructorCode);
  }

  await evaluatePilotAwards(pilotProfileId);
  await syncInstructorAddonWithMembership(
    pilotProfileId,
    updated.subscriptionPlan.code,
    true,
  );

  return {
    ok: true,
    subscription: toSubscriptionDto(updated),
    enrolled: false,
    upgradeFeeUsd: Math.max(0, Math.round(upgradeFeeUsd * 100) / 100),
    membershipDiscountUsd: 0,
  };
}

/** @deprecated Use setPilotMembershipTier â€” kept for callers expecting enroll-only semantics. */
export async function enrollPilotInPlan(
  pilotProfileId: string,
  planId: string,
): Promise<
  | { ok: true; subscription: PilotSubscriptionDto }
  | { ok: false; error: string; status: 404 | 409 }
> {
  const result = await setPilotMembershipTier(pilotProfileId, planId);
  if (!result.ok) {
    return { ok: false, error: result.error, status: result.status };
  }
  if (!result.enrolled) {
    return {
      ok: false,
      error:
        "You already have an active membership. Use Fast Forward to upgrade your grade.",
      status: 409,
    };
  }
  return { ok: true, subscription: result.subscription };
}

export async function cancelPilotSubscription(
  pilotProfileId: string,
): Promise<
  | { ok: true; subscription: PilotSubscriptionDto }
  | { ok: false; error: string; status: 404 }
> {
  const existing = await prisma.pilotSubscription.findFirst({
    where: {
      pilotProfileId,
      status: { in: [...ACTIVE_STATUSES] },
    },
    include: { subscriptionPlan: true },
    orderBy: { createdAt: "desc" },
  });

  if (!existing) {
    return { ok: false, error: "No active membership to cancel.", status: 404 };
  }

  const updated = await prisma.pilotSubscription.update({
    where: { id: existing.id },
    data: { status: "cancelled" },
    include: { subscriptionPlan: true },
  });

  await syncInstructorAddonWithMembership(pilotProfileId, null, false);

  return { ok: true, subscription: toSubscriptionDto(updated) };
}
