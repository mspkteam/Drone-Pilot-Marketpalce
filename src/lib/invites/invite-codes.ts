import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { adminSetPilotGrade } from "@/lib/admin/pilots";
import { membershipTierRank } from "@/lib/wings/conditions";
import { TIER_CODE_TO_PRICING_PLAN_CODE } from "@/lib/membership/pricing-tier-codes";

export const INVITEE_DISCOUNT_PERCENT = 10;
export const INVITER_REWARD_PER_INVITE_PERCENT = 10;
export const INVITER_REWARD_CAP_PERCENT = 50;
export const INVITES_FOR_PROMOTION = 10;

function generateInviteCode(): string {
  // Short, human-shareable: RAS-XXXXXXXX
  const raw = randomBytes(5).toString("hex").toUpperCase().slice(0, 8);
  return `RAS-${raw}`;
}

export async function ensureUserInviteCode(userId: string): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { inviteCode: true },
  });
  if (existing?.inviteCode) return existing.inviteCode;

  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateInviteCode();
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { inviteCode: code },
        select: { inviteCode: true },
      });
      return updated.inviteCode!;
    } catch {
      // unique collision — retry
    }
  }
  throw new Error("Could not allocate invite code.");
}

export async function applyInviteCodeOnRegister(
  inviteeUserId: string,
  inviteCodeRaw: string | null | undefined,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const code = inviteCodeRaw?.trim().toUpperCase();
  if (!code) return { ok: true };

  const inviter = await prisma.user.findFirst({
    where: { inviteCode: code },
    select: {
      id: true,
      role: true,
      inviteRewardPercent: true,
      inviteRewardExpiresAt: true,
      pilotProfile: { select: { id: true } },
    },
  });
  if (!inviter) {
    return { ok: false, error: "Invalid invite code." };
  }
  if (inviter.id === inviteeUserId) {
    return { ok: false, error: "You cannot use your own invite code." };
  }

  const already = await prisma.inviteRedemption.findUnique({
    where: { inviteeId: inviteeUserId },
  });
  if (already) return { ok: true };

  const now = new Date();
  const yearAgo = new Date(now);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);

  const rewardExpires = new Date(now);
  rewardExpires.setFullYear(rewardExpires.getFullYear() + 1);

  await prisma.$transaction(async (tx) => {
    await tx.inviteRedemption.create({
      data: {
        inviterId: inviter.id,
        inviteeId: inviteeUserId,
        inviteCode: code,
      },
    });

    await tx.user.update({
      where: { id: inviteeUserId },
      data: {
        invitedByUserId: inviter.id,
        inviteeDiscountPercent: INVITEE_DISCOUNT_PERCENT,
      },
    });

    const currentReward =
      inviter.inviteRewardExpiresAt && inviter.inviteRewardExpiresAt > now
        ? inviter.inviteRewardPercent
        : 0;
    const nextReward = Math.min(
      INVITER_REWARD_CAP_PERCENT,
      currentReward + INVITER_REWARD_PER_INVITE_PERCENT,
    );

    await tx.user.update({
      where: { id: inviter.id },
      data: {
        inviteRewardPercent: nextReward,
        inviteRewardExpiresAt: rewardExpires,
      },
    });
  });

  // 10 successful invites in the last year → promote inviter one grade (pilots).
  const invitesThisYear = await prisma.inviteRedemption.count({
    where: {
      inviterId: inviter.id,
      createdAt: { gte: yearAgo },
    },
  });

  if (
    invitesThisYear >= INVITES_FOR_PROMOTION &&
    inviter.role === "pilot" &&
    inviter.pilotProfile
  ) {
    await promoteInviterOneGrade(inviter.pilotProfile.id);
  }

  return { ok: true };
}

async function promoteInviterOneGrade(pilotProfileId: string): Promise<void> {
  const sub = await prisma.pilotSubscription.findFirst({
    where: {
      pilotProfileId,
      status: { in: ["active", "trialing"] },
    },
    include: { subscriptionPlan: { select: { code: true } } },
    orderBy: { createdAt: "desc" },
  });
  const currentCode = sub?.subscriptionPlan.code ?? "A1_STUDENT";
  const rank = membershipTierRank(currentCode);
  if (rank >= 6) return; // cap marketplace promotion at A-6

  const nextPricing = `A-${rank + 1}`;
  const nextCode =
    Object.entries(TIER_CODE_TO_PRICING_PLAN_CODE).find(
      ([, pricing]) => pricing === nextPricing,
    )?.[0] ?? null;
  if (!nextCode) return;

  await adminSetPilotGrade(pilotProfileId, nextCode);
}

/** Effective membership discount % for a user (invitee 10% or inviter stacked reward). */
export async function getMembershipInviteDiscountPercent(
  userId: string,
): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      inviteeDiscountPercent: true,
      inviteRewardPercent: true,
      inviteRewardExpiresAt: true,
    },
  });
  if (!user) return 0;

  const now = new Date();
  const reward =
    user.inviteRewardExpiresAt && user.inviteRewardExpiresAt > now
      ? user.inviteRewardPercent
      : 0;
  return Math.max(user.inviteeDiscountPercent, reward, 0);
}
