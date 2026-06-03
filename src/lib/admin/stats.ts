import { prisma } from "@/lib/db";
import { countWaitlistSubscribers } from "@/lib/waitlist/waitlist";
import { countActiveDisputes } from "@/lib/disputes/dispute";
import { countPendingVerifications } from "@/lib/verification/verification";
import type { AdminOverviewStats } from "@/types/admin";

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const [
    pendingJobs,
    pendingPilots,
    pendingVerifications,
    openJobs,
    activeBookings,
    totalUsers,
    totalPilots,
    totalClients,
    completedBookings,
    commissionAgg,
    waitlistSubscribers,
    activeDisputes,
  ] = await Promise.all([
    prisma.job.count({ where: { status: "pending_approval" } }),
    prisma.pilotProfile.count({ where: { status: "pending_review" } }),
    countPendingVerifications(),
    prisma.job.count({ where: { status: "open" } }),
    prisma.booking.count({
      where: { status: { in: ["pending", "confirmed", "in_progress"] } },
    }),
    prisma.user.count(),
    prisma.pilotProfile.count(),
    prisma.clientProfile.count(),
    prisma.booking.count({ where: { status: "completed" } }),
    prisma.commission.aggregate({ _sum: { amount: true } }),
    countWaitlistSubscribers(),
    countActiveDisputes(),
  ]);

  return {
    pendingJobs,
    pendingPilots,
    pendingVerifications,
    openJobs,
    activeBookings,
    totalUsers,
    totalPilots,
    totalClients,
    completedBookings,
    totalCommission: commissionAgg._sum.amount ?? 0,
    waitlistSubscribers,
    activeDisputes,
  };
}
