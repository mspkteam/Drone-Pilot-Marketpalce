import type { Job } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { toJobDto } from "@/lib/jobs/job";
import type { JobStatus } from "@/types/job";
import type { AdminJobDto } from "@/types/admin-job";

export type { AdminJobDto };

type JobWithClient = Job & {
  clientProfile: {
    contactName: string;
    companyName: string | null;
    user: { email: string };
  };
};

const jobInclude = {
  clientProfile: {
    include: {
      user: { select: { email: true } },
    },
  },
} as const;

function toAdminJobDto(job: JobWithClient): AdminJobDto {
  return {
    ...toJobDto(job),
    client: {
      contactName: job.clientProfile.contactName,
      companyName: job.clientProfile.companyName,
      email: job.clientProfile.user.email,
    },
  };
}

export async function listJobsForAdmin(filter?: JobStatus | "all") {
  const where =
    filter && filter !== "all" ? { status: filter } : undefined;

  const jobs = await prisma.job.findMany({
    where,
    include: jobInclude,
    orderBy: [{ submittedAt: "desc" }, { updatedAt: "desc" }],
  });

  return jobs.map(toAdminJobDto);
}

export async function getJobForAdmin(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: jobInclude,
  });
  return job ? toAdminJobDto(job) : null;
}

export async function countPendingJobs() {
  return prisma.job.count({ where: { status: "pending_approval" } });
}
