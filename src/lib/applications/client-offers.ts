import { prisma } from "@/lib/db";
import { toApplicationDto } from "@/lib/applications/application";
import type { ClientJobApplicationDto } from "@/types/booking";

export async function listApplicationsForClientJob(
  jobId: string,
  clientProfileId: string,
) {
  const job = await prisma.job.findFirst({
    where: { id: jobId, clientProfileId },
    select: { id: true, status: true, booking: { select: { id: true } } },
  });

  if (!job) return null;

  const applications = await prisma.jobApplication.findMany({
    where: { jobId },
    include: {
      pilotProfile: {
        select: {
          id: true,
          displayName: true,
          locationCity: true,
          locationRegion: true,
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  const offers: ClientJobApplicationDto[] = applications.map((app) => ({
    ...toApplicationDto(app),
    pilot: app.pilotProfile,
  }));

  return {
    jobId: job.id,
    jobStatus: job.status,
    hasBooking: Boolean(job.booking),
    offers,
  };
}
