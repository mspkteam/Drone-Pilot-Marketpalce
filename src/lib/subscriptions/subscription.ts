import type { PilotSubscription, SubscriptionPlan } from "@/generated/prisma/client";
import { toMembershipTierDto } from "@/lib/membership/membership";
import { prisma } from "@/lib/db";
import type {
  PilotSubscriptionDto,
  SubscriptionStatus,
} from "@/types/subscription";
import type { MembershipTierDto } from "@/types/membership";

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

export async function enrollPilotInPlan(
  pilotProfileId: string,
  planId: string,
): Promise<
  | { ok: true; subscription: PilotSubscriptionDto }
  | { ok: false; error: string; status: 404 | 409 }
> {
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
  });

  if (existing) {
    return {
      ok: false,
      error:
        "You already have an active membership. Cancel it before switching tiers.",
      status: 409,
    };
  }

  const now = new Date();
  const periodEnd = addYears(now, 1);

  const sub = await prisma.pilotSubscription.create({
    data: {
      pilotProfileId,
      subscriptionPlanId: plan.id,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      externalSubscriptionId: "demo_internal",
    },
    include: { subscriptionPlan: true },
  });

  return { ok: true, subscription: toSubscriptionDto(sub) };
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

  return { ok: true, subscription: toSubscriptionDto(updated) };
}
