import type { Job } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  parseJobPostProjectMetadata,
  serializeJobPostProjectMetadata,
} from "@/lib/jobs/post-project-metadata";
import type { JobPostProjectMetadata } from "@/lib/jobs/post-project-metadata";
import type { JobDto, JobCategoryId, JobStatus } from "@/types/job";

export type { JobPostProjectMetadata };
export { parseJobPostProjectMetadata, serializeJobPostProjectMetadata };

export function toJobDto(job: Job): JobDto {
  return {
    id: job.id,
    clientProfileId: job.clientProfileId,
    title: job.title,
    description: job.description,
    category: job.category as JobCategoryId,
    locationLabel: job.locationLabel,
    locationCity: job.locationCity,
    locationRegion: job.locationRegion,
    locationCountry: job.locationCountry,
    scheduledDate: job.scheduledDate?.toISOString() ?? null,
    budgetMin: job.budgetMin,
    budgetMax: job.budgetMax,
    currency: job.currency,
    requirements: job.requirements,
    postProject: parseJobPostProjectMetadata(job.postProjectJson),
    status: job.status as JobStatus,
    rejectionReason: job.rejectionReason,
    submittedAt: job.submittedAt?.toISOString() ?? null,
    approvedAt: job.approvedAt?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

export async function getClientProfileIdForUser(userId: string) {
  const profile = await prisma.clientProfile.findUnique({
    where: { userId },
    select: { id: true, onboardingCompletedAt: true },
  });
  return profile;
}

export async function listJobsForClient(clientProfileId: string) {
  return prisma.job.findMany({
    where: { clientProfileId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getJobForClient(jobId: string, clientProfileId: string) {
  return prisma.job.findFirst({
    where: { id: jobId, clientProfileId },
  });
}

export async function getClientJobDetail(jobId: string, clientProfileId: string) {
  return prisma.job.findFirst({
    where: { id: jobId, clientProfileId },
    include: {
      _count: { select: { applications: true } },
      booking: { select: { id: true } },
    },
  });
}
