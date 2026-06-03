import { prisma } from "@/lib/db";
import type { AdminUserDto } from "@/types/admin";
import type { UserRole } from "@/types/roles";

export async function listUsersForAdmin(): Promise<AdminUserDto[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      pilotProfile: { select: { id: true } },
      clientProfile: { select: { id: true } },
    },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role as UserRole,
    status: u.status,
    createdAt: u.createdAt.toISOString(),
    pilotProfileId: u.pilotProfile?.id ?? null,
    clientProfileId: u.clientProfile?.id ?? null,
  }));
}
