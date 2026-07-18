import { DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";
import { getEffectiveCommissionRate } from "@/lib/admin/platform-settings";
import { prisma } from "@/lib/db";
import type {
  PilotRateDetail,
  PilotRateSearchResult,
} from "@/types/admin-configuration";

const ACTIVE_MEMBERSHIP = ["active", "trialing"] as const;

/** Maps a membership tier code (e.g. "A4_SENIOR_FLIGHT_OFFICER") to a grade label ("A-4"). */
export function gradeLabelFromTierCode(code: string | null | undefined): string {
  if (!code) return "A-1";
  const match = /^A(\d+)/i.exec(code);
  return match ? `A-${match[1]}` : "A-1";
}

const pilotRateInclude = {
  user: { select: { email: true } },
  subscriptions: {
    where: { status: { in: [...ACTIVE_MEMBERSHIP] } },
    include: { subscriptionPlan: { select: { code: true } } },
    orderBy: { createdAt: "desc" as const },
    take: 1,
  },
};

/** Rounds a fraction (0.075) to a display percent number (7.5), max 2 decimals. */
function fractionToPercent(fraction: number): number {
  return Math.round(fraction * 100 * 100) / 100;
}

export async function searchPilotsForRates(
  query: string,
  limit = 8,
): Promise<PilotRateSearchResult[]> {
  const trimmed = query.trim();

  const pilots = await prisma.pilotProfile.findMany({
    where: trimmed
      ? {
          OR: [
            { displayName: { contains: trimmed, mode: "insensitive" } },
            { user: { email: { contains: trimmed, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: pilotRateInclude,
    orderBy: { displayName: "asc" },
    take: Math.min(Math.max(limit, 1), 25),
  });

  return pilots.map((pilot) => ({
    pilotProfileId: pilot.id,
    displayName: pilot.displayName.trim() || pilot.user.email,
    email: pilot.user.email,
    rank: gradeLabelFromTierCode(pilot.subscriptions[0]?.subscriptionPlan.code),
    hasOverride: pilot.commissionOverrideEnabled,
  }));
}

export async function getPilotRateDetail(
  pilotProfileId: string,
): Promise<PilotRateDetail | null> {
  const pilot = await prisma.pilotProfile.findUnique({
    where: { id: pilotProfileId },
    include: pilotRateInclude,
  });
  if (!pilot) return null;

  const defaultRate = await getEffectiveCommissionRate();

  return {
    pilotProfileId: pilot.id,
    displayName: pilot.displayName.trim() || pilot.user.email,
    email: pilot.user.email,
    rank: gradeLabelFromTierCode(pilot.subscriptions[0]?.subscriptionPlan.code),
    defaultCommissionPercent: fractionToPercent(defaultRate),
    manualOverrideEnabled: pilot.commissionOverrideEnabled,
    customCommissionPercent:
      pilot.commissionOverrideRate != null
        ? fractionToPercent(pilot.commissionOverrideRate)
        : null,
    reason: pilot.commissionOverrideReason ?? "",
    effectiveDate: pilot.commissionOverrideEffective ?? "",
    updatedAt: pilot.commissionOverrideUpdatedAt?.toISOString() ?? null,
  };
}

export type SavePilotRateInput = {
  pilotProfileId: string;
  manualOverrideEnabled: boolean;
  /** Percent number entered by the admin, e.g. 7.5. */
  customCommissionPercent: number | null;
  reason: string;
  effectiveDate: string;
  setByUserId: string;
};

export type SavePilotRateResult =
  | { ok: true; detail: PilotRateDetail }
  | { ok: false; error: string; status: number };

export async function savePilotRateOverride(
  input: SavePilotRateInput,
): Promise<SavePilotRateResult> {
  const pilot = await prisma.pilotProfile.findUnique({
    where: { id: input.pilotProfileId },
    select: { id: true },
  });
  if (!pilot) {
    return { ok: false, error: "Pilot not found.", status: 404 };
  }

  let rateFraction: number | null = null;
  if (input.manualOverrideEnabled) {
    if (
      input.customCommissionPercent == null ||
      Number.isNaN(input.customCommissionPercent)
    ) {
      return {
        ok: false,
        error: "Enter a custom commission rate to enable the override.",
        status: 400,
      };
    }
    if (input.customCommissionPercent < 0 || input.customCommissionPercent > 100) {
      return {
        ok: false,
        error: "Commission rate must be between 0% and 100%.",
        status: 400,
      };
    }
    rateFraction = Math.round(input.customCommissionPercent) === input.customCommissionPercent
      ? input.customCommissionPercent / 100
      : Math.round((input.customCommissionPercent / 100) * 10000) / 10000;
  }

  await prisma.pilotProfile.update({
    where: { id: input.pilotProfileId },
    data: {
      commissionOverrideEnabled: input.manualOverrideEnabled,
      commissionOverrideRate: rateFraction,
      commissionOverrideReason: input.reason.trim() || null,
      commissionOverrideEffective: input.effectiveDate.trim() || null,
      commissionOverrideUpdatedAt: new Date(),
      commissionOverrideSetById: input.setByUserId,
    },
  });

  const detail = await getPilotRateDetail(input.pilotProfileId);
  if (!detail) {
    return { ok: false, error: "Pilot not found.", status: 404 };
  }
  return { ok: true, detail };
}

/**
 * Effective commission rate (fraction) for a pilot's payout: their enabled
 * per-pilot override, otherwise the persisted platform default.
 */
export async function getEffectiveCommissionRateForPilot(
  pilotProfileId: string,
): Promise<number> {
  const pilot = await prisma.pilotProfile.findUnique({
    where: { id: pilotProfileId },
    select: { commissionOverrideEnabled: true, commissionOverrideRate: true },
  });

  if (
    pilot?.commissionOverrideEnabled &&
    pilot.commissionOverrideRate != null
  ) {
    return pilot.commissionOverrideRate;
  }

  try {
    return await getEffectiveCommissionRate();
  } catch {
    return DEFAULT_COMMISSION_RATE;
  }
}
