import type { Job, JobApplication } from "@/generated/prisma/client";
import {
  canPilotApplyToJobById,
  getPilotActiveTier,
  getVisibleJobsForPilot,
} from "@/lib/membership/membership";
import { prisma } from "@/lib/db";
import { triggerBidReceived } from "@/lib/notifications/triggers";
import type {
  ApplicationStatus,
  JobApplicationDto,
  PilotApplicationListItemDto,
  PilotJobDetailDto,
  PilotJobsListResponse,
  PilotLockedJobDto,
  PilotOpenJobDto,
} from "@/types/application";

export function toApplicationDto(app: JobApplication): JobApplicationDto {
  return {
    id: app.id,
    jobId: app.jobId,
    pilotProfileId: app.pilotProfileId,
    proposedAmount: app.proposedAmount,
    currency: app.currency,
    message: app.message,
    estimatedDeliveryDate: app.estimatedDeliveryDate?.toISOString() ?? null,
    status: app.status as ApplicationStatus,
    submittedAt: app.submittedAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  };
}

function mapJobToOpenDto(
  job: Job & { applications: { id: string }[] },
  visibleAt: Date,
  canApply: boolean,
): PilotOpenJobDto {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    category: job.category,
    locationLabel: job.locationLabel,
    locationCity: job.locationCity,
    locationRegion: job.locationRegion,
    locationCountry: job.locationCountry,
    scheduledDate: job.scheduledDate?.toISOString() ?? null,
    budgetMin: job.budgetMin,
    budgetMax: job.budgetMax,
    currency: job.currency,
    requirements: job.requirements,
    status: job.status,
    createdAt: job.createdAt.toISOString(),
    approvedAt: job.approvedAt?.toISOString() ?? null,
    visibleAt: visibleAt.toISOString(),
    canApply,
    hasApplied: job.applications.length > 0,
    applicationId: job.applications[0]?.id ?? null,
  };
}

function mapLockedJob(
  job: Job,
  visibleAt: Date,
  delayHours: number,
): PilotLockedJobDto {
  return {
    id: job.id,
    title: job.title,
    locationLabel: job.locationLabel,
    category: job.category,
    status: job.status,
    visibleAt: visibleAt.toISOString(),
    jobVisibilityDelayHours: delayHours,
  };
}

const A1_APPLY_MESSAGE =
  "Your A-1 Student tier allows job viewing after 48 hours, but bidding requires upgrading to A-2 or higher.";

export async function listOpenJobsForPilot(
  pilotProfileId: string,
): Promise<PilotJobsListResponse> {
  const { tier, visible, locked } = await getVisibleJobsForPilot(pilotProfileId);

  if (!tier) {
    return {
      jobs: [],
      lockedJobs: [],
      membership: null,
      applyBlockedMessage: "Enroll in a membership tier to browse marketplace jobs.",
    };
  }

  const jobs = visible.map(({ job, visibleAt, canApply }) =>
    mapJobToOpenDto(job, visibleAt, canApply),
  );

  const lockedJobs = locked.map(({ job, visibleAt }) =>
    mapLockedJob(job, visibleAt, tier.jobVisibilityDelayHours),
  );

  return {
    jobs,
    lockedJobs,
    membership: {
      tierName: tier.name,
      tierCode: tier.code,
      jobVisibilityDelayHours: tier.jobVisibilityDelayHours,
      canApply: tier.canApply,
      instructorEligible: tier.instructorEligible,
    },
    applyBlockedMessage: tier.canApply ? null : A1_APPLY_MESSAGE,
  };
}

/** @deprecated Use listOpenJobsForPilot — returns visible jobs only */
export async function listVisibleOpenJobsForPilot(pilotProfileId: string) {
  const result = await listOpenJobsForPilot(pilotProfileId);
  return result.jobs;
}

export async function getOpenJobForPilot(
  jobId: string,
  pilotProfileId: string,
): Promise<PilotJobDetailDto | null> {
  const tier = await getPilotActiveTier(pilotProfileId);
  if (!tier) return null;

  const job = await prisma.job.findFirst({
    where: { id: jobId, status: { in: ["open", "in_bidding"] } },
    include: {
      applications: {
        where: { pilotProfileId },
      },
    },
  });

  if (!job || !job.approvedAt) return null;

  const { visible, locked } = await getVisibleJobsForPilot(pilotProfileId);
  const inVisible = visible.some((v) => v.job.id === jobId);
  const inLocked = locked.some((l) => l.job.id === jobId);

  if (!inVisible && !inLocked) return null;

  const visibleEntry = visible.find((v) => v.job.id === jobId);
  const lockedEntry = locked.find((l) => l.job.id === jobId);
  const visibleAt = visibleEntry?.visibleAt ?? lockedEntry!.visibleAt;

  const applyCheck = await canPilotApplyToJobById(pilotProfileId, jobId);

  const dto = mapJobToOpenDto(
    job,
    visibleAt,
    applyCheck.allowed && !job.applications.length,
  );

  return {
    job: dto,
    application: job.applications[0]
      ? toApplicationDto(job.applications[0])
      : null,
    canApply: applyCheck.allowed && !job.applications.length,
    applyBlockedMessage: applyCheck.allowed
      ? null
      : (applyCheck.reason ?? A1_APPLY_MESSAGE),
  };
}

export async function createJobApplication(
  jobId: string,
  pilotProfileId: string,
  input: {
    proposedAmount: number;
    message: string | null;
    estimatedDeliveryDate: string | null;
    currency: string;
  },
): Promise<
  | { ok: true; application: JobApplicationDto }
  | { ok: false; error: string; status: 403 | 404 | 409 }
> {
  const applyCheck = await canPilotApplyToJobById(pilotProfileId, jobId);
  if (!applyCheck.allowed) {
    return {
      ok: false,
      error: applyCheck.reason ?? "You cannot apply to this job.",
      status: 403,
    };
  }

  const job = await prisma.job.findFirst({
    where: { id: jobId, status: { in: ["open", "in_bidding"] } },
  });

  if (!job) {
    return {
      ok: false,
      error: "Job not found or not open for applications.",
      status: 404,
    };
  }

  const existing = await prisma.jobApplication.findUnique({
    where: {
      jobId_pilotProfileId: { jobId, pilotProfileId },
    },
  });

  if (existing) {
    return {
      ok: false,
      error: "You have already submitted an application for this job.",
      status: 409,
    };
  }

  const estimatedDeliveryDate = input.estimatedDeliveryDate
    ? new Date(input.estimatedDeliveryDate)
    : null;

  const application = await prisma.$transaction(async (tx) => {
    const created = await tx.jobApplication.create({
      data: {
        jobId,
        pilotProfileId,
        proposedAmount: input.proposedAmount,
        currency: input.currency || job.currency,
        message: input.message,
        estimatedDeliveryDate,
        status: "submitted",
      },
    });

    if (job.status === "open") {
      await tx.job.update({
        where: { id: jobId },
        data: { status: "in_bidding" },
      });
    }

    return created;
  });

  const pilot = await prisma.pilotProfile.findUnique({
    where: { id: pilotProfileId },
    select: { displayName: true },
  });
  triggerBidReceived(jobId, job.title, pilot?.displayName ?? "A pilot");

  return { ok: true, application: toApplicationDto(application) };
}

export async function listApplicationsForPilot(pilotProfileId: string) {
  const apps = await prisma.jobApplication.findMany({
    where: { pilotProfileId },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          locationLabel: true,
          status: true,
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  return apps.map(
    (app): PilotApplicationListItemDto => ({
      ...toApplicationDto(app),
      job: app.job,
    }),
  );
}
