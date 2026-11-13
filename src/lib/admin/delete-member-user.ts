import { deactivateUserAccount } from "@/lib/account/deactivation";
import { prisma } from "@/lib/db";
import { isManagementUserRole } from "@/types/roles";

export type DeleteMemberUserResult =
  | {
      ok: true;
      deletedId: string;
      email: string;
      role: string;
      mode: "soft" | "hard";
    }
  | { ok: false; error: string; status: 400 | 403 | 404 };

/**
 * Pilot/client: soft-deactivate (30-day reactivation window, then cron purge).
 * Admin/moderator: hard-delete related rows. Cannot delete self or Super Admin
 * unless `allowSelf` is set (testing instant hard-delete for pilot/client only).
 */
export async function deleteMemberUser(
  targetUserId: string,
  actorUserId: string,
  options?: { allowSelf?: boolean },
): Promise<DeleteMemberUserResult> {
  const allowSelf = options?.allowSelf === true;

  if (targetUserId === actorUserId && !allowSelf) {
    return {
      ok: false,
      error: "You cannot delete your own account.",
      status: 403,
    };
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, email: true, role: true, status: true },
  });
  if (!target) {
    return { ok: false, error: "User not found.", status: 404 };
  }

  if (target.role === "super_admin") {
    return {
      ok: false,
      error: "Super Admin accounts cannot be deleted here.",
      status: 403,
    };
  }

  if (allowSelf && target.role !== "pilot" && target.role !== "client") {
    return {
      ok: false,
      error: "Only pilot or client test accounts can self-delete.",
      status: 403,
    };
  }

  // QA: admin “delete” for members starts a 30-day grace period (unless self-test hard delete).
  if (
    !allowSelf &&
    (target.role === "pilot" || target.role === "client")
  ) {
    if (target.status === "deactivated") {
      return {
        ok: false,
        error:
          "Account is already in the 30-day grace period. Reactivate from login or wait for automatic permanent deletion.",
        status: 400,
      };
    }
    await deactivateUserAccount(targetUserId);
    return {
      ok: true,
      deletedId: target.id,
      email: target.email,
      role: target.role,
      mode: "soft",
    };
  }

  try {
    // Interactive transactions default to 5s — heavy pilot/client graphs need more.
    await prisma.$transaction(
      async (tx) => {
        const pilot = await tx.pilotProfile.findUnique({
          where: { userId: targetUserId },
          select: { id: true },
        });
        const client = await tx.clientProfile.findUnique({
          where: { userId: targetUserId },
          select: { id: true },
        });

        if (pilot) {
          await tx.instructorStudentInvite.deleteMany({
            where: {
              OR: [
                { instructorProfileId: pilot.id },
                { inviteeProfileId: pilot.id },
              ],
            },
          });
          await tx.instructorWingRequest.deleteMany({
            where: {
              OR: [
                { instructorProfileId: pilot.id },
                { studentProfileId: pilot.id },
              ],
            },
          });
          await tx.aviatorWingRequest.deleteMany({
            where: { pilotProfileId: pilot.id },
          });
          await tx.pilotWing.deleteMany({
            where: { pilotProfileId: pilot.id },
          });
          await tx.pilotCertificate.deleteMany({
            where: { pilotProfileId: pilot.id },
          });
          await tx.pilotSubscription.deleteMany({
            where: { pilotProfileId: pilot.id },
          });
          await tx.verification.deleteMany({
            where: { pilotProfileId: pilot.id },
          });
          await tx.reviewResetRequest.deleteMany({
            where: { pilotProfileId: pilot.id },
          });
          await tx.pilotProfile.updateMany({
            where: { referredByInstructorId: pilot.id },
            data: { referredByInstructorId: null },
          });
        }

        if (client) {
          await tx.job.deleteMany({ where: { clientProfileId: client.id } });
        }

        await tx.emailVerificationToken.deleteMany({
          where: { userId: targetUserId },
        });
        await tx.notification.deleteMany({ where: { userId: targetUserId } });
        await tx.inviteRedemption.deleteMany({
          where: {
            OR: [{ inviterId: targetUserId }, { inviteeId: targetUserId }],
          },
        });
        await tx.moderatorPermissionRecord.deleteMany({
          where: { userId: targetUserId },
        });
        await tx.uniformOrder.deleteMany({ where: { userId: targetUserId } });

        await tx.user.updateMany({
          where: { invitedByUserId: targetUserId },
          data: { invitedByUserId: null },
        });

        // Null out staff assignments that would block delete.
        await tx.supportChat.updateMany({
          where: { assignedAdminId: targetUserId },
          data: { assignedAdminId: null },
        });
        await tx.supportChat.updateMany({
          where: { requesterUserId: targetUserId },
          data: { requesterUserId: null },
        });
        await tx.supportChatMessage.updateMany({
          where: { senderUserId: targetUserId },
          data: { senderUserId: null },
        });
        await tx.dispute.updateMany({
          where: { reviewedByUserId: targetUserId },
          data: { reviewedByUserId: null },
        });
        await tx.dispute.updateMany({
          where: { resolvedByUserId: targetUserId },
          data: { resolvedByUserId: null },
        });

        if (pilot) {
          await tx.pilotProfile.delete({ where: { id: pilot.id } });
        }
        if (client) {
          await tx.clientProfile.delete({ where: { id: client.id } });
        }

        // Remaining User-owned rows cascade (messages, disputes opened, reviews, etc.).
        await tx.user.delete({ where: { id: targetUserId } });
      },
      { maxWait: 15_000, timeout: 60_000 },
    );
  } catch (err) {
    console.error("[admin] deleteMemberUser failed:", err);
    return {
      ok: false,
      error:
        "Could not delete this account because related records are still linked. Suspend the login instead, or contact support.",
      status: 400,
    };
  }

  return {
    ok: true,
    deletedId: target.id,
    email: target.email,
    role: target.role,
    mode: "hard",
  };
}

export function canDeleteMemberRole(role: string): boolean {
  return role === "pilot" || role === "client" || isManagementUserRole(role);
}
