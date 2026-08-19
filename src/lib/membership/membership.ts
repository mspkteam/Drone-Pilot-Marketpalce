import type { Job, SubscriptionPlan } from "@/generated/prisma/client";
import {
  getPricingCodeForTierCode,
  parsePlanFeaturesMeta,
  planMetaToBulletFeatures,
} from "@/lib/admin/plan-features";
import { prisma } from "@/lib/db";
import { getCurrentPilotSubscription } from "@/lib/subscriptions/subscription";
import type { MembershipTierDto, PilotMembershipSummaryDto } from "@/types/membership";

export function computeJobVisibleAt(
  approvedAt: Date,
  delayHours: number,
): Date {
  return new Date(approvedAt.getTime() + delayHours * 60 * 60 * 1000);
}

export function isJobVisibleNow(
  approvedAt: Date | null | undefined,
  delayHours: number,
  now: Date = new Date(),
): boolean {
  if (!approvedAt) return false;
  return now.getTime() >= computeJobVisibleAt(approvedAt, delayHours).getTime();
}

export function toMembershipTierDto(plan: SubscriptionPlan): MembershipTierDto {
  if (!plan.code) {
    throw new Error(`Subscription plan ${plan.id} is missing tier code.`);
  }
  const pricingCode = getPricingCodeForTierCode(plan.code);
  const meta = parsePlanFeaturesMeta(plan.features, pricingCode);

  return {
    id: plan.id,
    code: plan.code,
    name: plan.name,
    slug: plan.slug,
    priceYearly: plan.priceYearly,
    priceMonthly: plan.priceMonthly,
    currency: plan.currency,
    jobVisibilityDelayHours: plan.jobVisibilityDelayHours,
    canViewJobs: plan.canViewJobs,
    canApply: plan.canApply,
    instructorEligible: plan.instructorEligible,
    sortOrder: plan.sortOrder,
    features: planMetaToBulletFeatures(meta),
    isActive: plan.isActive,
    description: meta.description,
    isRecommended: meta.isRecommended,
    displayFeatures: meta.displayFeatures.map(({ label, included }) => ({
      label,
      included,
    })),
  };
}

function parseTierFeatures(features: string): string[] {
  try {
    const parsed = JSON.parse(features);
    if (Array.isArray(parsed)) {
      return parsed.map(String);
    }
    if (parsed && typeof parsed === "object" && (parsed as { v?: number }).v === 2) {
      const pricingCode = null;
      const meta = parsePlanFeaturesMeta(features, pricingCode);
      return planMetaToBulletFeatures(meta);
    }
    return [];
  } catch {
    return [];
  }
}

export async function getPilotActiveTier(
  pilotProfileId: string,
): Promise<MembershipTierDto | null> {
  const sub = await getCurrentPilotSubscription(pilotProfileId);
  if (!sub) return null;
  return sub.plan;
}

export async function getPilotMembershipSummary(
  pilotProfileId: string,
): Promise<PilotMembershipSummaryDto | null> {
  const sub = await getCurrentPilotSubscription(pilotProfileId);
  if (!sub) return null;

  return {
    subscriptionId: sub.id,
    status: sub.status,
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd: sub.currentPeriodEnd,
    tier: sub.plan,
  };
}

export function canPilotViewJob(
  tier: MembershipTierDto,
  job: Pick<Job, "status" | "approvedAt">,
  now: Date = new Date(),
): boolean {
  if (!tier.canViewJobs) return false;
  if (!["open", "in_bidding"].includes(job.status)) return false;
  if (!job.approvedAt) return false;
  return isJobVisibleNow(job.approvedAt, tier.jobVisibilityDelayHours, now);
}

export function canPilotApplyToJob(
  tier: MembershipTierDto,
  job: Pick<Job, "status" | "approvedAt">,
  now: Date = new Date(),
): boolean {
  if (!tier.canApply) return false;
  return canPilotViewJob(tier, job, now);
}

export function isPilotInstructorEligible(
  tier: MembershipTierDto | null,
): boolean {
  return tier?.instructorEligible ?? false;
}

export async function canPilotViewJobById(
  pilotProfileId: string,
  jobId: string,
  now: Date = new Date(),
): Promise<boolean> {
  const tier = await getPilotActiveTier(pilotProfileId);
  if (!tier) return false;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { status: true, approvedAt: true },
  });
  if (!job) return false;
  return canPilotViewJob(tier, job, now);
}

export async function canPilotApplyToJobById(
  pilotProfileId: string,
  jobId: string,
  now: Date = new Date(),
): Promise<{ allowed: boolean; reason?: string }> {
  const tier = await getPilotActiveTier(pilotProfileId);
  if (!tier) {
    return { allowed: false, reason: "Active membership tier required." };
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { status: true, approvedAt: true, title: true },
  });

  if (!job) {
    return { allowed: false, reason: "Job not found." };
  }

  if (!job.approvedAt) {
    return { allowed: false, reason: "Job is not approved yet." };
  }

  if (!canPilotViewJob(tier, job, now)) {
    const visibleAt = computeJobVisibleAt(
      job.approvedAt,
      tier.jobVisibilityDelayHours,
    );
    return {
      allowed: false,
      reason: `This job becomes visible on ${visibleAt.toLocaleString()} for your ${tier.name} tier.`,
    };
  }

  if (!tier.canApply) {
    return {
      allowed: false,
      reason:
        "Your A-1 Student tier allows job viewing after 48 hours, but bidding requires upgrading to A-2 or higher.",
    };
  }

  return { allowed: true };
}

export type JobVisibilityBucket = "visible" | "locked" | "hidden";

export function classifyJobVisibility(
  tier: MembershipTierDto,
  job: Pick<Job, "status" | "approvedAt">,
  now: Date = new Date(),
): JobVisibilityBucket {
  if (!["open", "in_bidding"].includes(job.status)) return "hidden";
  if (!job.approvedAt) return "hidden";
  if (!tier.canViewJobs) return "hidden";
  if (canPilotViewJob(tier, job, now)) return "visible";
  return "locked";
}

export async function getVisibleJobsForPilot(
  pilotProfileId: string,
  now: Date = new Date(),
) {
  const tier = await getPilotActiveTier(pilotProfileId);
  if (!tier) {
    return {
      tier: null,
      visible: [] as Array<{ job: Job; visibleAt: Date; canApply: boolean }>,
      locked: [] as Array<{ job: Job; visibleAt: Date }>,
    };
  }

  const jobs = await prisma.job.findMany({
    where: { status: { in: ["open", "in_bidding"] } },
    orderBy: { approvedAt: "desc" },
    include: {
      clientProfile: {
        select: { companyName: true, contactName: true, preferencesJson: true },
      },
      applications: {
        where: { pilotProfileId },
        select: { id: true },
      },
    },
  });

  const visible: Array<{ job: (typeof jobs)[0]; visibleAt: Date; canApply: boolean }> =
    [];
  const locked: Array<{ job: (typeof jobs)[0]; visibleAt: Date }> = [];

  for (const job of jobs) {
    const bucket = classifyJobVisibility(tier, job, now);
    if (bucket === "hidden" || !job.approvedAt) continue;

    const visibleAt = computeJobVisibleAt(
      job.approvedAt,
      tier.jobVisibilityDelayHours,
    );

    if (bucket === "visible") {
      visible.push({
        job,
        visibleAt,
        canApply: canPilotApplyToJob(tier, job, now),
      });
    } else if (bucket === "locked") {
      locked.push({ job, visibleAt });
    }
  }

  return { tier, visible, locked };
}
