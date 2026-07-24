import { prisma } from "@/lib/db";
import {
  buildJobPostingJsonLd,
  getSiteOrigin,
  type PublicJobForPosting,
} from "@/lib/jobs/job-posting-jsonld";

const publicJobSelect = {
  id: true,
  title: true,
  description: true,
  category: true,
  locationLabel: true,
  locationCity: true,
  locationRegion: true,
  locationCountry: true,
  budgetMin: true,
  budgetMax: true,
  currency: true,
  requirements: true,
  scheduledDate: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
  clientProfile: {
    select: {
      companyName: true,
      contactName: true,
    },
  },
} as const;

/** Approved open jobs only — safe for public crawl / Google Jobs. */
export async function getPublicOpenJob(
  jobId: string,
): Promise<PublicJobForPosting | null> {
  const row = await prisma.job.findFirst({
    where: {
      id: jobId,
      status: "open",
      approvedAt: { not: null },
    },
    select: publicJobSelect,
  });
  return row;
}

export async function listPublicOpenJobs(limit = 50): Promise<
  Array<Pick<PublicJobForPosting, "id" | "title" | "locationLabel" | "approvedAt" | "createdAt">>
> {
  return prisma.job.findMany({
    where: {
      status: "open",
      approvedAt: { not: null },
    },
    select: {
      id: true,
      title: true,
      locationLabel: true,
      approvedAt: true,
      createdAt: true,
    },
    orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
    take: Math.min(100, Math.max(1, limit)),
  });
}

export function publicJobPostingScript(job: PublicJobForPosting): string {
  return JSON.stringify(buildJobPostingJsonLd(job, { origin: getSiteOrigin() }));
}
