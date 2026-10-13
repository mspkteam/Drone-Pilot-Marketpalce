import { prisma } from "@/lib/db";
import { parseProfileExtrasJson } from "@/lib/pilot/profile-extras";
import { grantWingToPilot } from "@/lib/wings/wings";
import {
  INSTRUCTOR_WING_LABELS,
  isInstructorAwardableWingCode,
  type InstructorAwardableWingCode,
} from "@/lib/instructor/constants";

export type InstructorStudentDto = {
  profileId: string;
  displayName: string;
  email: string;
  memberNumber: string | null;
  avatarUrl: string | null;
  publicHref: string;
  linkedVia: "code" | "invite";
  linkedAt: string;
  wingCodes: string[];
};

export type InstructorStudentInviteDto = {
  id: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  message: string | null;
  createdAt: string;
  respondedAt: string | null;
  instructorProfileId: string;
  instructorName: string;
  inviteeProfileId: string;
  inviteeName: string;
  inviteeEmail: string;
};

function toInviteStatus(
  status: string,
): InstructorStudentInviteDto["status"] {
  if (
    status === "pending" ||
    status === "accepted" ||
    status === "declined" ||
    status === "cancelled"
  ) {
    return status;
  }
  return "pending";
}

export async function listInstructorStudents(
  instructorProfileId: string,
): Promise<InstructorStudentDto[]> {
  const students = await prisma.pilotProfile.findMany({
    where: { referredByInstructorId: instructorProfileId },
    select: {
      id: true,
      displayName: true,
      profileExtrasJson: true,
      updatedAt: true,
      createdAt: true,
      user: { select: { email: true, memberNumber: true } },
      wings: {
        select: { wingDefinition: { select: { code: true } } },
      },
    },
    orderBy: { displayName: "asc" },
  });

  const acceptedInvites = await prisma.instructorStudentInvite.findMany({
    where: {
      instructorProfileId,
      status: "accepted",
      inviteeProfileId: { in: students.map((s) => s.id) },
    },
    select: { inviteeProfileId: true },
  });
  const invitedIds = new Set(acceptedInvites.map((i) => i.inviteeProfileId));

  return students.map((s) => {
    const extras = parseProfileExtrasJson(s.profileExtrasJson);
    return {
      profileId: s.id,
      displayName: s.displayName,
      email: s.user.email,
      memberNumber: s.user.memberNumber,
      avatarUrl: extras.avatarUrl,
      publicHref: `/pilots/${s.id}`,
      linkedVia: invitedIds.has(s.id) ? "invite" : "code",
      linkedAt: s.updatedAt.toISOString(),
      wingCodes: s.wings.map((w) => w.wingDefinition.code),
    };
  });
}

export async function listInstructorOutgoingInvites(
  instructorProfileId: string,
): Promise<InstructorStudentInviteDto[]> {
  const rows = await prisma.instructorStudentInvite.findMany({
    where: { instructorProfileId },
    include: {
      instructorProfile: { select: { id: true, displayName: true } },
      inviteeProfile: {
        select: {
          id: true,
          displayName: true,
          user: { select: { email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return rows.map((row) => ({
    id: row.id,
    status: toInviteStatus(row.status),
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    respondedAt: row.respondedAt?.toISOString() ?? null,
    instructorProfileId: row.instructorProfile.id,
    instructorName: row.instructorProfile.displayName,
    inviteeProfileId: row.inviteeProfile.id,
    inviteeName: row.inviteeProfile.displayName,
    inviteeEmail: row.inviteeProfile.user.email,
  }));
}

export async function listPendingStudentInvites(
  inviteeProfileId: string,
): Promise<InstructorStudentInviteDto[]> {
  const rows = await prisma.instructorStudentInvite.findMany({
    where: { inviteeProfileId, status: "pending" },
    include: {
      instructorProfile: { select: { id: true, displayName: true } },
      inviteeProfile: {
        select: {
          id: true,
          displayName: true,
          user: { select: { email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    status: toInviteStatus(row.status),
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    respondedAt: row.respondedAt?.toISOString() ?? null,
    instructorProfileId: row.instructorProfile.id,
    instructorName: row.instructorProfile.displayName,
    inviteeProfileId: row.inviteeProfile.id,
    inviteeName: row.inviteeProfile.displayName,
    inviteeEmail: row.inviteeProfile.user.email,
  }));
}

export async function inviteExistingPilotAsStudent(
  instructorProfileId: string,
  rawQuery: string,
  message?: string | null,
): Promise<
  | { ok: true; invite: InstructorStudentInviteDto }
  | { ok: false; error: string; status: 400 | 403 | 404 | 409 }
> {
  const query = rawQuery.trim();
  if (!query) {
    return {
      ok: false,
      error: "Enter a student email or member number.",
      status: 400,
    };
  }

  const instructor = await prisma.pilotProfile.findUnique({
    where: { id: instructorProfileId },
    select: {
      id: true,
      displayName: true,
      instructorAddonActive: true,
    },
  });
  if (!instructor?.instructorAddonActive) {
    return {
      ok: false,
      error: "Activate Instructor Membership to invite students.",
      status: 403,
    };
  }

  const normalizedEmail = query.toLowerCase();
  const memberDigits = query.replace(/\D/g, "");
  const inviteeUser = await prisma.user.findFirst({
    where: {
      role: "pilot",
      OR: [
        { email: normalizedEmail },
        ...(memberDigits ? [{ memberNumber: memberDigits }] : []),
      ],
    },
    select: {
      id: true,
      email: true,
      pilotProfile: { select: { id: true, displayName: true } },
    },
  });

  if (!inviteeUser?.pilotProfile) {
    return {
      ok: false,
      error: "No pilot account found for that email or member number.",
      status: 404,
    };
  }

  const inviteeProfileId = inviteeUser.pilotProfile.id;
  if (inviteeProfileId === instructorProfileId) {
    return { ok: false, error: "You cannot invite yourself.", status: 400 };
  }

  const invitee = await prisma.pilotProfile.findUnique({
    where: { id: inviteeProfileId },
    select: { referredByInstructorId: true },
  });
  if (invitee?.referredByInstructorId === instructorProfileId) {
    return {
      ok: false,
      error: "This pilot is already on your student roster.",
      status: 409,
    };
  }
  if (
    invitee?.referredByInstructorId &&
    invitee.referredByInstructorId !== instructorProfileId
  ) {
    return {
      ok: false,
      error: "This pilot is already linked to another instructor.",
      status: 409,
    };
  }

  const existingPending = await prisma.instructorStudentInvite.findFirst({
    where: {
      instructorProfileId,
      inviteeProfileId,
      status: "pending",
    },
  });
  if (existingPending) {
    return {
      ok: false,
      error: "An invite is already pending for this pilot.",
      status: 409,
    };
  }

  const created = await prisma.instructorStudentInvite.create({
    data: {
      instructorProfileId,
      inviteeProfileId,
      status: "pending",
      message: message?.trim() || null,
    },
    include: {
      instructorProfile: { select: { id: true, displayName: true } },
      inviteeProfile: {
        select: {
          id: true,
          displayName: true,
          user: { select: { email: true } },
        },
      },
    },
  });

  return {
    ok: true,
    invite: {
      id: created.id,
      status: "pending",
      message: created.message,
      createdAt: created.createdAt.toISOString(),
      respondedAt: null,
      instructorProfileId: created.instructorProfile.id,
      instructorName: created.instructorProfile.displayName,
      inviteeProfileId: created.inviteeProfile.id,
      inviteeName: created.inviteeProfile.displayName,
      inviteeEmail: created.inviteeProfile.user.email,
    },
  };
}

export async function respondToInstructorStudentInvite(
  inviteeProfileId: string,
  inviteId: string,
  action: "accept" | "decline",
): Promise<
  | { ok: true; invite: InstructorStudentInviteDto }
  | { ok: false; error: string; status: 400 | 403 | 404 | 409 }
> {
  const invite = await prisma.instructorStudentInvite.findUnique({
    where: { id: inviteId },
    include: {
      instructorProfile: {
        select: {
          id: true,
          displayName: true,
          instructorAddonActive: true,
        },
      },
      inviteeProfile: {
        select: {
          id: true,
          displayName: true,
          referredByInstructorId: true,
          user: { select: { email: true } },
        },
      },
    },
  });

  if (!invite || invite.inviteeProfileId !== inviteeProfileId) {
    return { ok: false, error: "Invite not found.", status: 404 };
  }
  if (invite.status !== "pending") {
    return { ok: false, error: "This invite is no longer pending.", status: 409 };
  }

  if (action === "decline") {
    const updated = await prisma.instructorStudentInvite.update({
      where: { id: inviteId },
      data: { status: "declined", respondedAt: new Date() },
    });
    return {
      ok: true,
      invite: {
        id: updated.id,
        status: "declined",
        message: updated.message,
        createdAt: updated.createdAt.toISOString(),
        respondedAt: updated.respondedAt?.toISOString() ?? null,
        instructorProfileId: invite.instructorProfile.id,
        instructorName: invite.instructorProfile.displayName,
        inviteeProfileId: invite.inviteeProfile.id,
        inviteeName: invite.inviteeProfile.displayName,
        inviteeEmail: invite.inviteeProfile.user.email,
      },
    };
  }

  if (!invite.instructorProfile.instructorAddonActive) {
    return {
      ok: false,
      error: "That instructor add-on is no longer active.",
      status: 403,
    };
  }

  if (
    invite.inviteeProfile.referredByInstructorId &&
    invite.inviteeProfile.referredByInstructorId !==
      invite.instructorProfileId
  ) {
    return {
      ok: false,
      error: "You are already linked to another instructor.",
      status: 409,
    };
  }

  await prisma.$transaction([
    prisma.pilotProfile.update({
      where: { id: inviteeProfileId },
      data: { referredByInstructorId: invite.instructorProfileId },
    }),
    prisma.instructorStudentInvite.update({
      where: { id: inviteId },
      data: { status: "accepted", respondedAt: new Date() },
    }),
    prisma.instructorStudentInvite.updateMany({
      where: {
        inviteeProfileId,
        status: "pending",
        NOT: { id: inviteId },
      },
      data: { status: "cancelled", respondedAt: new Date() },
    }),
  ]);

  return {
    ok: true,
    invite: {
      id: invite.id,
      status: "accepted",
      message: invite.message,
      createdAt: invite.createdAt.toISOString(),
      respondedAt: new Date().toISOString(),
      instructorProfileId: invite.instructorProfile.id,
      instructorName: invite.instructorProfile.displayName,
      inviteeProfileId: invite.inviteeProfile.id,
      inviteeName: invite.inviteeProfile.displayName,
      inviteeEmail: invite.inviteeProfile.user.email,
    },
  };
}

/** Instructor awards wings directly from the Students roster (no prior request). */
export async function awardWingToStudentDirect(
  instructorProfileId: string,
  instructorUserId: string,
  studentProfileId: string,
  wingCode: string,
): Promise<
  | { ok: true; wingCode: InstructorAwardableWingCode; wingLabel: string }
  | { ok: false; error: string; status: 400 | 403 | 404 | 409 }
> {
  if (!isInstructorAwardableWingCode(wingCode)) {
    return {
      ok: false,
      error: "Instructors can only award Silver Pilot Wings or Gold Basic Wings.",
      status: 400,
    };
  }

  const instructor = await prisma.pilotProfile.findUnique({
    where: { id: instructorProfileId },
    select: { instructorAddonActive: true },
  });
  if (!instructor?.instructorAddonActive) {
    return {
      ok: false,
      error: "Activate Instructor Membership to award student wings.",
      status: 403,
    };
  }

  const student = await prisma.pilotProfile.findUnique({
    where: { id: studentProfileId },
    select: { id: true, referredByInstructorId: true },
  });
  if (!student || student.referredByInstructorId !== instructorProfileId) {
    return {
      ok: false,
      error: "Student is not on your roster.",
      status: 404,
    };
  }

  const definition = await prisma.wingDefinition.findUnique({
    where: { code: wingCode },
    select: { id: true },
  });
  if (!definition) {
    return {
      ok: false,
      error: "Wing definition is not configured yet.",
      status: 404,
    };
  }

  const granted = await grantWingToPilot(studentProfileId, definition.id, {
    source: "instructor",
    assignedByUserId: instructorUserId,
    metadata: { directAward: true },
  });
  if (!granted.ok) {
    return {
      ok: false,
      error: granted.error,
      status: granted.status === 404 ? 404 : 400,
    };
  }
  if (!granted.created) {
    return {
      ok: false,
      error: "Student already holds these wings.",
      status: 409,
    };
  }

  // Keep request history in sync when a matching open request exists.
  await prisma.instructorWingRequest.updateMany({
    where: {
      instructorProfileId,
      studentProfileId,
      wingCode,
      status: { in: ["pending", "needs_info"] },
    },
    data: {
      status: "awarded",
      resolvedAt: new Date(),
      instructorNote: "Awarded from Students roster.",
    },
  });

  return {
    ok: true,
    wingCode,
    wingLabel: INSTRUCTOR_WING_LABELS[wingCode],
  };
}
