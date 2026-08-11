import type { Job, JobApplication } from "@/generated/prisma/client";
import { canWithdrawApplication } from "@/lib/applications/status";
import {
  parseProposalDetails,
  serializeProposalDetails,
  type ProposalDetails,
} from "@/lib/applications/proposal-metadata";
import {
  canPilotApplyToJobById,
  getPilotActiveTier,
  getVisibleJobsForPilot,
} from "@/lib/membership/membership";
import { prisma } from "@/lib/db";
import { triggerBidReceived } from "@/lib/notifications/triggers";
import { evaluatePilotAwards } from "@/lib/certificates/certificate";
import type {
  ApplicationStatus,
  JobApplicationDto,
  PilotApplicationListItemDto,
  PilotJobDetailDto,
  PilotJobsListResponse,
  PilotLockedJobDto,
  PilotOpenJobDto,
  PilotProposalDetailDto,
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
    proposalDetails: parseProposalDetails(app.proposalDetailsJson),
    shortlistedAt: app.shortlistedAt?.toISOString() ?? null,
    status: app.status as ApplicationStatus,
    submittedAt: app.submittedAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  };
}

function clientDisplayName(
  profile: { companyName: string | null; contactName: string } | undefined,
): string {
  if (!profile) return "Client";
  return profile.companyName?.trim() || profile.contactName?.trim() || "Client";
}

const A1_APPLY_MESSAGE =
  "Your A-1 Student tier allows job viewing after 48 hours, but bidding requires upgrading to A-2 or higher.";

export type PilotJobsQueryFilters = {
  q?: string;
  category?: string;
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
};

function jobApplyBlockedReason(
  tier: { canApply: boolean },
  canApply: boolean,
): string | null {
  if (canApply) return null;
  if (!tier.canApply) return A1_APPLY_MESSAGE;
  return "Bidding is not available for this mission with your current tier.";
}

function filterOpenJob(
  job: PilotOpenJobDto,
  filters: PilotJobsQueryFilters,
): boolean {
  if (filters.category && job.category !== filters.category) return false;

  if (filters.budgetMin != null) {
    const jobMax = job.budgetMax ?? job.budgetMin;
    if (jobMax == null || jobMax < filters.budgetMin) return false;
  }

  if (filters.budgetMax != null) {
    const jobMin = job.budgetMin ?? job.budgetMax;
    if (jobMin != null && jobMin > filters.budgetMax) return false;
  }

  if (filters.location) {
    const locationHaystack = [
      job.locationLabel,
      job.locationCity,
      job.locationRegion,
      job.locationCountry,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!locationHaystack.includes(filters.location.toLowerCase())) return false;
  }

  if (filters.q) {
    const haystack = [
      job.title,
      job.description,
      job.locationLabel,
      job.clientDisplayName,
      job.category,
      job.requirements,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(filters.q.toLowerCase())) return false;
  }

  return true;
}

function mapJobToOpenDto(
  job: Job & {
    applications: { id: string }[];
    clientProfile?: { companyName: string | null; contactName: string };
  },
  visibleAt: Date,
  canApply: boolean,
  applyBlockedReason: string | null,
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
    applyBlockedReason,
    hasApplied: job.applications.length > 0,
    applicationId: job.applications[0]?.id ?? null,
    clientDisplayName: clientDisplayName(job.clientProfile),
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
    budgetMin: job.budgetMin,
    budgetMax: job.budgetMax,
    currency: job.currency,
    requirements: job.requirements,
  };
}

export async function listOpenJobsForPilot(
  pilotProfileId: string,
  filters: PilotJobsQueryFilters = {},
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

  const jobs = visible
    .map(({ job, visibleAt, canApply }) =>
      mapJobToOpenDto(
        job,
        visibleAt,
        canApply,
        jobApplyBlockedReason(tier, canApply),
      ),
    )
    .filter((job) => filterOpenJob(job, filters));

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

/** @deprecated Use listOpenJobsForPilot â€” returns visible jobs only */
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
      clientProfile: {
        select: { companyName: true, contactName: true },
      },
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
  const canApply = applyCheck.allowed && !job.applications.length;

  const dto = mapJobToOpenDto(
    job,
    visibleAt,
    canApply,
    canApply ? null : (applyCheck.reason ?? A1_APPLY_MESSAGE),
  );

  return {
    job: dto,
    application: job.applications[0]
      ? toApplicationDto(job.applications[0])
      : null,
    canApply,
    applyBlockedMessage: canApply ? null : (applyCheck.reason ?? A1_APPLY_MESSAGE),
    membership: {
      tierName: tier.name,
      jobVisibilityDelayHours: tier.jobVisibilityDelayHours,
    },
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
    proposalDetails?: ProposalDetails | null;
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

  const proposalDetailsJson =
    input.proposalDetails != null
      ? serializeProposalDetails(input.proposalDetails)
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
        proposalDetailsJson,
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
  await evaluatePilotAwards(pilotProfileId);

  return { ok: true, application: toApplicationDto(application) };
}

function jobClientDisplayName(profile: {
  companyName: string | null;
  contactName: string;
}): string {
  return profile.companyName?.trim() || profile.contactName?.trim() || "Client";
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
          clientProfile: {
            select: { companyName: true, contactName: true },
          },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  return apps.map(
    (app): PilotApplicationListItemDto => ({
      ...toApplicationDto(app),
      job: {
        id: app.job.id,
        title: app.job.title,
        locationLabel: app.job.locationLabel,
        status: app.job.status,
        clientDisplayName: jobClientDisplayName(app.job.clientProfile),
      },
    }),
  );
}

export async function getApplicationForPilot(
  applicationId: string,
  pilotProfileId: string,
): Promise<PilotProposalDetailDto | null> {
  const app = await prisma.jobApplication.findFirst({
    where: { id: applicationId, pilotProfileId },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          locationLabel: true,
          scheduledDate: true,
          budgetMin: true,
          budgetMax: true,
          currency: true,
          requirements: true,
          status: true,
          clientProfile: {
            select: { companyName: true, contactName: true },
          },
        },
      },
    },
  });

  if (!app) return null;

  return {
    ...toApplicationDto(app),
    job: {
      id: app.job.id,
      title: app.job.title,
      description: app.job.description,
      category: app.job.category,
      locationLabel: app.job.locationLabel,
      scheduledDate: app.job.scheduledDate?.toISOString() ?? null,
      budgetMin: app.job.budgetMin,
      budgetMax: app.job.budgetMax,
      currency: app.job.currency,
      requirements: app.job.requirements,
      status: app.job.status,
      clientDisplayName: jobClientDisplayName(app.job.clientProfile),
    },
  };
}

export async function withdrawApplication(
  applicationId: string,
  pilotProfileId: string,
): Promise<
  | { ok: true; application: JobApplicationDto }
  | { ok: false; error: string; status: 403 | 404 | 409 }
> {
  const app = await prisma.jobApplication.findFirst({
    where: { id: applicationId, pilotProfileId },
  });

  if (!app) {
    return { ok: false, error: "Proposal not found.", status: 404 };
  }

  if (!canWithdrawApplication(app.status as ApplicationStatus)) {
    return {
      ok: false,
      error: "This proposal can no longer be withdrawn.",
      status: 409,
    };
  }

  const updated = await prisma.jobApplication.update({
    where: { id: applicationId },
    data: { status: "withdrawn" },
  });

  return { ok: true, application: toApplicationDto(updated) };
}
