import { prisma } from "@/lib/db";

export const ACCOUNT_REACTIVATION_DAYS = 30;

export function reactivationDeadline(deactivatedAt: Date): Date {
  const deadline = new Date(deactivatedAt);
  deadline.setUTCDate(deadline.getUTCDate() + ACCOUNT_REACTIVATION_DAYS);
  return deadline;
}

export function canReactivateAt(deactivatedAt: Date | null, now = new Date()): boolean {
  if (!deactivatedAt) return false;
  return now.getTime() <= reactivationDeadline(deactivatedAt).getTime();
}

export function purgeCutoffDate(now = new Date()): Date {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - ACCOUNT_REACTIVATION_DAYS);
  return cutoff;
}

export async function deactivateUserAccount(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      status: "deactivated",
      deactivatedAt: new Date(),
    },
  });
}

/**
 * Permanently deletes accounts whose 30-day reactivation window has ended.
 * Cascades remove profile/marketplace rows; batches to avoid long transactions.
 */
export async function purgeExpiredDeactivatedAccounts(
  now = new Date(),
  limit = 25,
): Promise<{ attempted: number; purged: number; failedIds: string[] }> {
  const cutoff = purgeCutoffDate(now);
  const expired = await prisma.user.findMany({
    where: {
      status: "deactivated",
      deactivatedAt: { lt: cutoff, not: null },
    },
    select: { id: true },
    take: Math.max(1, Math.min(limit, 100)),
    orderBy: { deactivatedAt: "asc" },
  });

  let purged = 0;
  const failedIds: string[] = [];
  for (const row of expired) {
    try {
      await prisma.user.delete({ where: { id: row.id } });
      purged += 1;
    } catch (err) {
      failedIds.push(row.id);
      if (process.env.NODE_ENV === "development") {
        console.warn("[purgeExpiredDeactivatedAccounts] failed", row.id, err);
      }
    }
  }

  return { attempted: expired.length, purged, failedIds };
}

export async function reactivateUserIfEligible(userId: string): Promise<{
  ok: true;
  restored: boolean;
} | { ok: false; error: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, status: true, deactivatedAt: true },
  });
  if (!user) {
    return { ok: false, error: "Account not found." };
  }
  if (user.status === "active") {
    return { ok: true, restored: false };
  }
  if (user.status !== "deactivated") {
    return { ok: false, error: "This account cannot be reactivated from login." };
  }
  if (!canReactivateAt(user.deactivatedAt)) {
    // Opportunistic hard-delete when the grace window has ended.
    try {
      await prisma.user.delete({ where: { id: user.id } });
    } catch {
      /* keep row if FK restrict; login still blocked */
    }
    return {
      ok: false,
      error: "The 30-day reactivation window has ended. Contact support.",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { status: "active", deactivatedAt: null },
  });
  return { ok: true, restored: true };
}
