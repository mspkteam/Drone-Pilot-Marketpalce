import { prisma } from "@/lib/db";
import {
  MEMBER_NUMBER_START,
  formatMemberNumber,
  parseMemberNumber,
} from "@/lib/members/member-number";

/**
 * Allocate the next RAS member number and persist it on the user.
 * Safe under concurrent creates via unique constraint + retry.
 */
export async function assignMemberNumberToUser(
  userId: string,
): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { memberNumber: true },
  });
  if (existing?.memberNumber) {
    return formatMemberNumber(existing.memberNumber);
  }

  for (let attempt = 0; attempt < 8; attempt++) {
    const next = await peekNextMemberNumberValue();
    const formatted = formatMemberNumber(next);
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { memberNumber: formatted },
      });
      return formatted;
    } catch {
      /* unique race — retry */
    }
  }

  throw new Error("Could not allocate a unique member number.");
}

async function peekNextMemberNumberValue(): Promise<number> {
  const rows = await prisma.user.findMany({
    where: { memberNumber: { not: null } },
    select: { memberNumber: true },
  });
  let max = MEMBER_NUMBER_START - 1;
  for (const row of rows) {
    const n = parseMemberNumber(row.memberNumber);
    if (n != null && n > max) max = n;
  }
  return max + 1;
}

/** Backfill member numbers for pilots/clients missing one (oldest first). */
export async function backfillMissingMemberNumbers(): Promise<number> {
  const users = await prisma.user.findMany({
    where: {
      memberNumber: null,
      role: { in: ["pilot", "client"] },
    },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  let assigned = 0;
  for (const user of users) {
    await assignMemberNumberToUser(user.id);
    assigned += 1;
  }
  return assigned;
}

export async function getUserMemberNumber(
  userId: string,
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { memberNumber: true },
  });
  return user?.memberNumber ? formatMemberNumber(user.memberNumber) : null;
}
