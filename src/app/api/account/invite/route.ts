import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  ensureUserInviteCode,
  getMembershipInviteDiscountPercent,
  INVITEE_DISCOUNT_PERCENT,
  INVITER_REWARD_CAP_PERCENT,
  INVITES_FOR_PROMOTION,
} from "@/lib/invites/invite-codes";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role;
  if (!userId || (role !== "pilot" && role !== "client")) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const inviteCode = await ensureUserInviteCode(userId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      inviteRewardPercent: true,
      inviteRewardExpiresAt: true,
      inviteeDiscountPercent: true,
    },
  });

  const yearAgo = new Date();
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const invitesThisYear = await prisma.inviteRedemption.count({
    where: { inviterId: userId, createdAt: { gte: yearAgo } },
  });

  const effectiveDiscountPercent =
    await getMembershipInviteDiscountPercent(userId);

  return NextResponse.json({
    inviteCode,
    inviteeDiscountPercent: INVITEE_DISCOUNT_PERCENT,
    inviteRewardPercent: user?.inviteRewardPercent ?? 0,
    inviteRewardExpiresAt: user?.inviteRewardExpiresAt?.toISOString() ?? null,
    inviteeOwnDiscountPercent: user?.inviteeDiscountPercent ?? 0,
    invitesThisYear,
    invitesForPromotion: INVITES_FOR_PROMOTION,
    rewardCapPercent: INVITER_REWARD_CAP_PERCENT,
    effectiveMembershipDiscountPercent: effectiveDiscountPercent,
  });
}
