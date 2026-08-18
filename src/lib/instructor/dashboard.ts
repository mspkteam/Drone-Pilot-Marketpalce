import { prisma } from "@/lib/db";
import { getCurrentPilotSubscription } from "@/lib/subscriptions/subscription";
import { resolveInstructorAddonStatus } from "@/lib/membership/instructor-addon";
import {
  getFastForwardTier,
  PILOT_INSTRUCTOR_ADDON_FEE_USD,
} from "@/lib/membership/pilot-membership-catalog";
import {
  listInstructorWingRequests,
  listStudentWingRequests,
} from "@/lib/instructor/wing-requests";
import type { InstructorAddonStatus } from "@/lib/membership/instructor-addon";
import type { InstructorWingRequestDto } from "@/lib/instructor/wing-requests";

export type InstructorDashboardDto = {
  status: InstructorAddonStatus;
  feeUsd: number;
  discountCode: string | null;
  periodEnd: string | null;
  tierCode: string | null;
  tierLabel: string | null;
  eligibleLabel: string;
  requests: InstructorWingRequestDto[];
  student: {
    instructorName: string | null;
    instructorId: string | null;
    instructorActive: boolean;
    myRequests: InstructorWingRequestDto[];
  };
};

export async function getInstructorDashboard(
  pilotProfileId: string,
): Promise<InstructorDashboardDto> {
  const profile = await prisma.pilotProfile.findUnique({
    where: { id: pilotProfileId },
    select: {
      instructorAddonActive: true,
      instructorAddonPeriodEnd: true,
      instructorDiscountCode: true,
      referredByInstructorId: true,
      referredByInstructor: {
        select: {
          id: true,
          displayName: true,
          instructorAddonActive: true,
        },
      },
    },
  });

  const subscription = await getCurrentPilotSubscription(pilotProfileId);
  const tierCode = subscription?.plan.code ?? null;
  const status = resolveInstructorAddonStatus({
    hasActiveMembership: subscription !== null,
    tierCode,
    instructorAddonActive: profile?.instructorAddonActive ?? false,
  });

  const tier = tierCode ? getFastForwardTier(tierCode) : undefined;
  const eligibleLabel = tier
    ? `ELIGIBLE: ${tier.pricingCode} ${tier.shortTitle}`.toUpperCase()
    : status === "locked"
      ? "LOCKED UNTIL A-4 SENIOR FLIGHT OFFICER"
      : "ELIGIBLE";

  const [requests, myRequests] = await Promise.all([
    status === "active"
      ? listInstructorWingRequests(pilotProfileId)
      : Promise.resolve([]),
    listStudentWingRequests(pilotProfileId),
  ]);

  return {
    status,
    feeUsd: PILOT_INSTRUCTOR_ADDON_FEE_USD,
    discountCode:
      status === "active" ? profile?.instructorDiscountCode ?? null : null,
    periodEnd: profile?.instructorAddonPeriodEnd?.toISOString() ?? null,
    tierCode,
    tierLabel: subscription?.plan.name ?? null,
    eligibleLabel,
    requests,
    student: {
      instructorName: profile?.referredByInstructor?.displayName ?? null,
      instructorId: profile?.referredByInstructor?.id ?? null,
      instructorActive:
        profile?.referredByInstructor?.instructorAddonActive ?? false,
      myRequests,
    },
  };
}
