import { prisma } from "@/lib/db";
import {
  buildInstructorDiscountCode,
  instructorMembershipDiscountUsd,
  normalizeInstructorDiscountCode,
} from "@/lib/instructor/constants";
import { PILOT_ANNUAL_MEMBERSHIP_FEE_USD } from "@/lib/membership/pilot-membership-catalog";

export async function ensureInstructorDiscountCode(
  pilotProfileId: string,
  displayName: string,
  existingCode: string | null,
): Promise<string> {
  if (existingCode?.trim()) {
    return normalizeInstructorDiscountCode(existingCode);
  }

  let candidate = buildInstructorDiscountCode(displayName);
  const clash = await prisma.pilotProfile.findFirst({
    where: {
      instructorDiscountCode: candidate,
      NOT: { id: pilotProfileId },
    },
    select: { id: true },
  });
  if (clash) {
    candidate = buildInstructorDiscountCode(displayName, pilotProfileId);
  }

  await prisma.pilotProfile.update({
    where: { id: pilotProfileId },
    data: { instructorDiscountCode: candidate },
  });
  return candidate;
}

export type ApplyInstructorDiscountResult =
  | {
      ok: true;
      instructorProfileId: string;
      instructorName: string;
      code: string;
      discountUsd: number;
      membershipDueUsd: number;
      alreadyLinked: boolean;
    }
  | { ok: false; error: string; status: 400 | 403 | 404 };

export async function applyInstructorDiscountCode(
  studentProfileId: string,
  rawCode: string,
): Promise<ApplyInstructorDiscountResult> {
  const code = normalizeInstructorDiscountCode(rawCode);
  if (!code) {
    return { ok: false, error: "Enter an instructor discount code.", status: 400 };
  }

  const instructor = await prisma.pilotProfile.findFirst({
    where: {
      instructorDiscountCode: code,
      instructorAddonActive: true,
    },
    select: {
      id: true,
      displayName: true,
      instructorAddonActive: true,
    },
  });

  if (!instructor) {
    return {
      ok: false,
      error: "That instructor code is invalid or the add-on is not active.",
      status: 404,
    };
  }

  if (instructor.id === studentProfileId) {
    return {
      ok: false,
      error: "You cannot apply your own instructor code.",
      status: 400,
    };
  }

  const student = await prisma.pilotProfile.findUnique({
    where: { id: studentProfileId },
    select: { referredByInstructorId: true },
  });
  if (!student) {
    return { ok: false, error: "Pilot profile not found.", status: 404 };
  }

  const alreadyLinked = student.referredByInstructorId === instructor.id;
  if (student.referredByInstructorId && !alreadyLinked) {
    return {
      ok: false,
      error: "You are already linked to another instructor.",
      status: 403,
    };
  }

  if (!alreadyLinked) {
    await prisma.pilotProfile.update({
      where: { id: studentProfileId },
      data: { referredByInstructorId: instructor.id },
    });
  }

  const discountUsd = instructorMembershipDiscountUsd(
    PILOT_ANNUAL_MEMBERSHIP_FEE_USD,
  );

  return {
    ok: true,
    instructorProfileId: instructor.id,
    instructorName: instructor.displayName,
    code,
    discountUsd,
    membershipDueUsd: PILOT_ANNUAL_MEMBERSHIP_FEE_USD - discountUsd,
    alreadyLinked,
  };
}

export async function lookupActiveInstructorByCode(rawCode: string) {
  const code = normalizeInstructorDiscountCode(rawCode);
  if (!code) return null;
  return prisma.pilotProfile.findFirst({
    where: {
      instructorDiscountCode: code,
      instructorAddonActive: true,
    },
    select: { id: true, displayName: true, instructorDiscountCode: true },
  });
}
