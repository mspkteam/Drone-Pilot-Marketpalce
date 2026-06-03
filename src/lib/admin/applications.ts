import { prisma } from "@/lib/db";
import type { AdminApplicationDto } from "@/types/admin";

export async function listApplicationsForAdmin(): Promise<AdminApplicationDto[]> {
  const apps = await prisma.jobApplication.findMany({
    include: {
      job: { select: { id: true, title: true } },
      pilotProfile: { select: { id: true, displayName: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return apps.map((a) => ({
    id: a.id,
    jobId: a.jobId,
    jobTitle: a.job.title,
    pilotProfileId: a.pilotProfileId,
    pilotName: a.pilotProfile.displayName,
    proposedAmount: a.proposedAmount,
    currency: a.currency,
    status: a.status,
    submittedAt: a.submittedAt.toISOString(),
  }));
}
