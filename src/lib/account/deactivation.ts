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

export async function deactivateUserAccount(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      status: "deactivated",
      deactivatedAt: new Date(),
    },
  });
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
