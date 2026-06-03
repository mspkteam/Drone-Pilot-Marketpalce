import { prisma } from "@/lib/db";
import { notifyAsync, sendNotification } from "@/lib/notifications/notify";
import { evaluateAndAssignWings } from "@/lib/wings/wings";
import type { AdminPilotDto } from "@/types/admin";
import type { PilotProfileStatus } from "@/types/pilot";
import { PILOT_PROFILE_STATUSES } from "@/types/pilot";

export async function listPilotsForAdmin(
  filter?: PilotProfileStatus | "all",
): Promise<AdminPilotDto[]> {
  const where =
    filter && filter !== "all" ? { status: filter } : undefined;

  const pilots = await prisma.pilotProfile.findMany({
    where,
    include: { user: { select: { email: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return pilots.map((p) => ({
    id: p.id,
    userId: p.userId,
    email: p.user.email,
    displayName: p.displayName,
    status: p.status as PilotProfileStatus,
    isPublic: p.isPublic,
    locationCity: p.locationCity,
    locationRegion: p.locationRegion,
    licenseNumber: p.licenseNumber,
    onboardingCompletedAt: p.onboardingCompletedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  }));
}

export async function approvePilotProfile(pilotProfileId: string) {
  const profile = await prisma.pilotProfile.findUnique({
    where: { id: pilotProfileId },
    select: { id: true, status: true, userId: true, displayName: true },
  });

  if (!profile) {
    return { ok: false as const, error: "Pilot not found.", status: 404 };
  }

  if (profile.status !== "pending_review") {
    return {
      ok: false as const,
      error: "Only profiles pending review can be approved.",
      status: 400,
    };
  }

  await prisma.pilotProfile.update({
    where: { id: pilotProfileId },
    data: { status: "approved" },
  });

  notifyAsync(async () => {
    await sendNotification({
      userId: profile.userId,
      type: "welcome",
      title: "Pilot profile approved",
      body: `Your pilot profile (${profile.displayName}) is approved. You can browse jobs and submit bids.`,
      payload: { pilotProfileId },
    });
  });

  await evaluateAndAssignWings(pilotProfileId);

  return { ok: true as const };
}

export async function rejectPilotProfile(pilotProfileId: string) {
  const profile = await prisma.pilotProfile.findUnique({
    where: { id: pilotProfileId },
    select: { id: true, status: true, userId: true, displayName: true },
  });

  if (!profile) {
    return { ok: false as const, error: "Pilot not found.", status: 404 };
  }

  if (profile.status !== "pending_review") {
    return {
      ok: false as const,
      error: "Only profiles pending review can be rejected.",
      status: 400,
    };
  }

  await prisma.pilotProfile.update({
    where: { id: pilotProfileId },
    data: { status: "rejected", isPublic: false },
  });

  notifyAsync(async () => {
    await sendNotification({
      userId: profile.userId,
      type: "welcome",
      title: "Pilot profile needs updates",
      body: `Your profile (${profile.displayName}) was not approved. Update your details and resubmit onboarding.`,
      payload: { pilotProfileId },
    });
  });

  return { ok: true as const };
}

export function isValidPilotFilter(
  value: string,
): value is PilotProfileStatus | "all" {
  return value === "all" || PILOT_PROFILE_STATUSES.includes(value as PilotProfileStatus);
}
