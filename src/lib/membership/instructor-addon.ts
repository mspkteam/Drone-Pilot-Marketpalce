import {
  isInstructorEligibleTierCode,
  PILOT_INSTRUCTOR_ADDON_FEE_USD,
} from "@/lib/membership/pilot-membership-catalog";
import { prisma } from "@/lib/db";
import { getCurrentPilotSubscription } from "@/lib/subscriptions/subscription";
import { toPilotProfileDto } from "@/lib/pilot/profile";
import type { PilotProfileDto } from "@/types/pilot";

function addYears(date: Date, years: number) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

export type InstructorAddonStatus = "locked" | "available" | "active";

export function resolveInstructorAddonStatus(input: {
  hasActiveMembership: boolean;
  tierCode: string | null;
  instructorAddonActive: boolean;
}): InstructorAddonStatus {
  const eligible =
    input.hasActiveMembership && isInstructorEligibleTierCode(input.tierCode);
  if (!eligible) return "locked";
  if (input.instructorAddonActive) return "active";
  return "available";
}

export async function setPilotInstructorAddon(
  pilotProfileId: string,
  active: boolean,
): Promise<
  | {
      ok: true;
      profile: PilotProfileDto;
      feeUsd: number;
      status: InstructorAddonStatus;
    }
  | { ok: false; error: string; status: 403 | 404 | 409 }
> {
  const profile = await prisma.pilotProfile.findUnique({
    where: { id: pilotProfileId },
  });
  if (!profile) {
    return { ok: false, error: "Pilot profile not found.", status: 404 };
  }

  const subscription = await getCurrentPilotSubscription(pilotProfileId);
  if (!subscription) {
    return {
      ok: false,
      error: "Active annual membership is required for Instructor.",
      status: 403,
    };
  }

  const eligible = isInstructorEligibleTierCode(subscription.plan.code);
  if (!eligible) {
    return {
      ok: false,
      error: "Instructor add-on requires grade A-4 or higher.",
      status: 403,
    };
  }

  if (active && profile.instructorAddonActive) {
    return {
      ok: false,
      error: "Instructor add-on is already active.",
      status: 409,
    };
  }

  if (!active && !profile.instructorAddonActive) {
    return {
      ok: false,
      error: "Instructor add-on is not active.",
      status: 409,
    };
  }

  const now = new Date();
  const updated = await prisma.pilotProfile.update({
    where: { id: pilotProfileId },
    data: active
      ? {
          instructorAddonActive: true,
          instructorAddonPeriodEnd: addYears(now, 1),
        }
      : {
          instructorAddonActive: false,
          instructorAddonPeriodEnd: null,
        },
  });

  return {
    ok: true,
    profile: toPilotProfileDto(updated),
    feeUsd: active ? PILOT_INSTRUCTOR_ADDON_FEE_USD : 0,
    status: resolveInstructorAddonStatus({
      hasActiveMembership: true,
      tierCode: subscription.plan.code,
      instructorAddonActive: updated.instructorAddonActive,
    }),
  };
}

/** Clear instructor add-on when membership is cancelled or grade falls below A-4. */
export async function syncInstructorAddonWithMembership(
  pilotProfileId: string,
  tierCode: string | null,
  hasActiveMembership: boolean,
): Promise<void> {
  const eligible =
    hasActiveMembership && isInstructorEligibleTierCode(tierCode);
  if (eligible) return;

  await prisma.pilotProfile.updateMany({
    where: {
      id: pilotProfileId,
      instructorAddonActive: true,
    },
    data: {
      instructorAddonActive: false,
      instructorAddonPeriodEnd: null,
    },
  });
}
