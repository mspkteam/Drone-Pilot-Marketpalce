import { prisma } from "@/lib/db";
import type { AdminClientDto } from "@/types/admin";

export async function listClientsForAdmin(): Promise<AdminClientDto[]> {
  const clients = await prisma.clientProfile.findMany({
    include: {
      user: { select: { email: true } },
      _count: { select: { jobs: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return clients.map((c) => ({
    id: c.id,
    userId: c.userId,
    email: c.user.email,
    contactName: c.contactName,
    companyName: c.companyName,
    status: c.status,
    jobCount: c._count.jobs,
    onboardingCompletedAt: c.onboardingCompletedAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  }));
}
