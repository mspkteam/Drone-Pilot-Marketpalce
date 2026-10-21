import { prisma } from "@/lib/db";
import { isManagementUserRole } from "@/types/roles";

export type DeleteMemberUserResult =
  | { ok: true; deletedId: string; email: string; role: string }
  | { ok: false; error: string; status: 400 | 403 | 404 };

/**
 * Permanently delete a member account (pilot, client, admin, or moderator)
 * and related marketplace data. Cannot delete self or Super Admin accounts.
 */
export async function deleteMemberUser(
  targetUserId: string,
  actorUserId: string,
): Promise<DeleteMemberUserResult> {
  if (targetUserId === actorUserId) {
    return {
      ok: false,
      error: "You cannot delete your own account.",
      status: 403,
    };
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, email: true, role: true },
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

  try {
    await prisma.$transaction(async (tx) => {
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
        await tx.pilotWing.deleteMany({ where: { pilotProfileId: pilot.id } });
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
    });
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
  };
}

export function canDeleteMemberRole(role: string): boolean {
  return role === "pilot" || role === "client" || isManagementUserRole(role);
}
