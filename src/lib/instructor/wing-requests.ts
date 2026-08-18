import { prisma } from "@/lib/db";
import { parseProfileExtrasJson } from "@/lib/pilot/profile-extras";
import { grantWingToPilot } from "@/lib/wings/wings";
import {
  INSTRUCTOR_WING_LABELS,
  isInstructorAwardableWingCode,
  isInstructorWingRequestStatus,
  type InstructorAwardableWingCode,
  type InstructorWingRequestStatus,
} from "@/lib/instructor/constants";

export type InstructorWingRequestDto = {
  id: string;
  studentProfileId: string;
  studentName: string;
  studentAvatarUrl: string | null;
  studentPublicHref: string;
  wingCode: InstructorAwardableWingCode;
  wingLabel: string;
  status: InstructorWingRequestStatus;
  instructorNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
};

function toRequestDto(row: {
  id: string;
  studentProfileId: string;
  wingCode: string;
  status: string;
  instructorNote: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
  studentProfile: {
    displayName: string;
    profileExtrasJson: string;
    isPublic: boolean;
  };
}): InstructorWingRequestDto {
  const extras = parseProfileExtrasJson(row.studentProfile.profileExtrasJson);
  const wingCode = isInstructorAwardableWingCode(row.wingCode)
    ? row.wingCode
    : "aviator-wings-basic-silver";
  const status = isInstructorWingRequestStatus(row.status)
    ? row.status
    : "pending";

  return {
    id: row.id,
    studentProfileId: row.studentProfileId,
    studentName: row.studentProfile.displayName,
    studentAvatarUrl: extras.avatarUrl || null,
    studentPublicHref: `/pilots/${row.studentProfileId}`,
    wingCode,
    wingLabel: INSTRUCTOR_WING_LABELS[wingCode],
    status,
    instructorNote: row.instructorNote,
    createdAt: row.createdAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
  };
}

const requestInclude = {
  studentProfile: {
    select: {
      displayName: true,
      profileExtrasJson: true,
      isPublic: true,
    },
  },
} as const;

export async function listInstructorWingRequests(
  instructorProfileId: string,
): Promise<InstructorWingRequestDto[]> {
  const rows = await prisma.instructorWingRequest.findMany({
    where: { instructorProfileId },
    include: requestInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toRequestDto);
}

export async function listStudentWingRequests(
  studentProfileId: string,
): Promise<InstructorWingRequestDto[]> {
  const rows = await prisma.instructorWingRequest.findMany({
    where: { studentProfileId },
    include: requestInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toRequestDto);
}

export async function createStudentWingRequest(
  studentProfileId: string,
  wingCode: string,
): Promise<
  | { ok: true; request: InstructorWingRequestDto }
  | { ok: false; error: string; status: 400 | 403 | 404 | 409 }
> {
  if (!isInstructorAwardableWingCode(wingCode)) {
    return {
      ok: false,
      error: "Instructors can only award Silver Pilot Wings or Gold Basic Wings.",
      status: 400,
    };
  }

  const student = await prisma.pilotProfile.findUnique({
    where: { id: studentProfileId },
    select: {
      id: true,
      referredByInstructorId: true,
      referredByInstructor: {
        select: { id: true, instructorAddonActive: true },
      },
    },
  });
  if (!student) {
    return { ok: false, error: "Pilot profile not found.", status: 404 };
  }
  if (!student.referredByInstructorId || !student.referredByInstructor) {
    return {
      ok: false,
      error: "Apply an instructor discount code before requesting wings.",
      status: 403,
    };
  }
  if (!student.referredByInstructor.instructorAddonActive) {
    return {
      ok: false,
      error: "Your instructor add-on is not currently active.",
      status: 403,
    };
  }

  const open = await prisma.instructorWingRequest.findFirst({
    where: {
      studentProfileId,
      instructorProfileId: student.referredByInstructorId,
      wingCode,
      status: { in: ["pending", "needs_info"] },
    },
  });
  if (open) {
    return {
      ok: false,
      error: "You already have an open request for these wings.",
      status: 409,
    };
  }

  const definition = await prisma.wingDefinition.findUnique({
    where: { code: wingCode },
    select: { id: true },
  });
  if (definition) {
    const alreadyAwarded = await prisma.pilotWing.findUnique({
      where: {
        pilotProfileId_wingDefinitionId: {
          pilotProfileId: studentProfileId,
          wingDefinitionId: definition.id,
        },
      },
      select: { id: true },
    });
    if (alreadyAwarded) {
      return {
        ok: false,
        error: "You already hold these wings.",
        status: 409,
      };
    }
  }

  const created = await prisma.instructorWingRequest.create({
    data: {
      instructorProfileId: student.referredByInstructorId,
      studentProfileId,
      wingCode,
      status: "pending",
    },
    include: requestInclude,
  });

  return { ok: true, request: toRequestDto(created) };
}

export async function reviewInstructorWingRequest(
  instructorProfileId: string,
  instructorUserId: string,
  requestId: string,
  action: "award" | "needs_info",
  note?: string,
): Promise<
  | { ok: true; request: InstructorWingRequestDto }
  | { ok: false; error: string; status: 400 | 403 | 404 | 409 }
> {
  const instructor = await prisma.pilotProfile.findUnique({
    where: { id: instructorProfileId },
    select: { instructorAddonActive: true },
  });
  if (!instructor?.instructorAddonActive) {
    return {
      ok: false,
      error: "Activate Instructor Membership to review student wings.",
      status: 403,
    };
  }

  const request = await prisma.instructorWingRequest.findUnique({
    where: { id: requestId },
  });
  if (!request || request.instructorProfileId !== instructorProfileId) {
    return { ok: false, error: "Request not found.", status: 404 };
  }
  if (request.status === "awarded") {
    return { ok: false, error: "These wings were already awarded.", status: 409 };
  }
  if (!isInstructorAwardableWingCode(request.wingCode)) {
    return {
      ok: false,
      error: "Instructors can only award Silver Pilot Wings or Gold Basic Wings.",
      status: 400,
    };
  }

  if (action === "needs_info") {
    const updated = await prisma.instructorWingRequest.update({
      where: { id: requestId },
      data: {
        status: "needs_info",
        instructorNote: note?.trim() || "Additional information required.",
      },
      include: requestInclude,
    });
    return { ok: true, request: toRequestDto(updated) };
  }

  const definition = await prisma.wingDefinition.findUnique({
    where: { code: request.wingCode },
    select: { id: true },
  });
  if (!definition) {
    return {
      ok: false,
      error: "Wing definition is not configured yet.",
      status: 404,
    };
  }

  const granted = await grantWingToPilot(
    request.studentProfileId,
    definition.id,
    {
      source: "instructor",
      assignedByUserId: instructorUserId,
      metadata: { instructorWingRequestId: request.id },
    },
  );
  if (!granted.ok) {
    return { ok: false, error: granted.error, status: granted.status };
  }

  const updated = await prisma.instructorWingRequest.update({
    where: { id: requestId },
    data: {
      status: "awarded",
      resolvedAt: new Date(),
      instructorNote: note?.trim() || null,
    },
    include: requestInclude,
  });

  return { ok: true, request: toRequestDto(updated) };
}
