import "server-only";

import {
  mapPublicPilotToFindPilot,
  type ClientFindPilot,
  type FindPilotProfileHrefMode,
} from "@/lib/client/find-pilots";
import { prisma } from "@/lib/db";
import { listPublicPilots } from "@/lib/pilot/public";

async function getCompletedBookingCounts(pilotProfileIds: string[]) {
  if (pilotProfileIds.length === 0) {
    return new Map<string, number>();
  }

  const rows = await prisma.booking.groupBy({
    by: ["pilotProfileId"],
    where: {
      pilotProfileId: { in: pilotProfileIds },
      status: "completed",
    },
    _count: { _all: true },
  });

  return new Map(rows.map((row) => [row.pilotProfileId, row._count._all]));
}

export async function listClientFindPilots(options?: {
  /** Client Find a Pilot lists approved pilots even if isPublic is still false. */
  includeUnlistedApproved?: boolean;
  profileHrefMode?: FindPilotProfileHrefMode;
}): Promise<ClientFindPilot[]> {
  const includeUnlistedApproved = options?.includeUnlistedApproved ?? true;
  const profileHrefMode = options?.profileHrefMode ?? "client";

  const pilots = await listPublicPilots({ includeUnlistedApproved });
  if (pilots.length === 0) return [];

  const completedCounts = await getCompletedBookingCounts(pilots.map((p) => p.id));

  return pilots
    .map((pilot) =>
      mapPublicPilotToFindPilot(pilot, completedCounts.get(pilot.id) ?? 0, {
        profileHrefMode,
      }),
    )
    .sort((a, b) => {
      const ratingA = Number.parseFloat(a.rating);
      const ratingB = Number.parseFloat(b.rating);
      const scoreA = Number.isFinite(ratingA) ? ratingA : 0;
      const scoreB = Number.isFinite(ratingB) ? ratingB : 0;
      return scoreB - scoreA;
    });
}
