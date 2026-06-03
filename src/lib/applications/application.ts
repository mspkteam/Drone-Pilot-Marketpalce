import type { JobApplication } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { triggerBidReceived } from "@/lib/notifications/triggers";
import type {
  ApplicationStatus,
  JobApplicationDto,
  PilotApplicationListItemDto,
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

export async function listOpenJobsForPilot(pilotProfileId: string) {
  const jobs = await prisma.job.findMany({
    where: { status: { in: ["open", "in_bidding"] } },
    orderBy: { approvedAt: "desc" },
    include: {
      applications: {
        where: { pilotProfileId },
        select: { id: true },
      },
    },
  });

  return jobs.map(
    (job): PilotOpenJobDto => ({
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
      hasApplied: job.applications.length > 0,
      applicationId: job.applications[0]?.id ?? null,
    }),
  );
}

export async function getOpenJobForPilot(jobId: string, pilotProfileId: string) {
  const job = await prisma.job.findFirst({
    where: { id: jobId, status: { in: ["open", "in_bidding"] } },
    include: {
      applications: {
        where: { pilotProfileId },
      },
    },
  });

  if (!job) return null;

  const dto: PilotOpenJobDto = {
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
    hasApplied: job.applications.length > 0,
    applicationId: job.applications[0]?.id ?? null,
  };

  return {
    job: dto,
    application: job.applications[0]
      ? toApplicationDto(job.applications[0])
      : null,
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
  | { ok: false; error: string; status: 404 | 409 }
> {
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
