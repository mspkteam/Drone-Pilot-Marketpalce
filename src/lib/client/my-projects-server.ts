import "server-only";

import { prisma } from "@/lib/db";
import { jobToClientMyProject, type ClientMyProject } from "@/lib/client/my-projects";

export async function listClientMyProjects(
  clientProfileId: string,
): Promise<ClientMyProject[]> {
  const jobs = await prisma.job.findMany({
    where: { clientProfileId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { applications: true } },
    },
  });

  return jobs.map(jobToClientMyProject);
}
