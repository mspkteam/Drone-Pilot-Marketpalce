import { DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";
import type { DisputeResolutionType } from "@/types/dispute";

/** RAS Payment v6: parties get 3 days to agree before squadron voting may start. */
export const DISPUTE_AGREEMENT_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;

/** Default minimum votes for a squadron ruling; below this the Super Admin decides. */
export const SQUADRON_MIN_VOTES = 5;

export function computeAgreementEndsAt(openedAt: Date): Date {
  return new Date(openedAt.getTime() + DISPUTE_AGREEMENT_PERIOD_MS);
}

/** Falls back to createdAt for disputes opened before `agreementEndsAt` existed. */
export function resolveAgreementEndsAt(dispute: {
  agreementEndsAt: Date | null;
  createdAt: Date;
}): Date {
  return dispute.agreementEndsAt ?? computeAgreementEndsAt(dispute.createdAt);
}

export function isAgreementPeriodActive(
  agreementEndsAt: Date,
  now = Date.now(),
): boolean {
  return now < agreementEndsAt.getTime();
}

export function formatAgreementTimeLeft(
  agreementEndsAt: Date,
  now = Date.now(),
): string {
  const remaining = agreementEndsAt.getTime() - now;
  if (remaining <= 0) return "Agreement period ended";
  const hours = Math.ceil(remaining / (60 * 60 * 1000));
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  return days > 0 ? `${days}D ${rest}H LEFT` : `${hours}H LEFT`;
}

export function isSquadronMinimumMet(
  votedCount: number,
  minVotes = SQUADRON_MIN_VOTES,
): boolean {
  return votedCount >= minVotes;
}

export type DisputeSplit = {
  /** Amount paid to the pilot (net of platform commission). */
  pilotAmount: number;
  /** Amount returned to the client. */
  clientAmount: number;
  /** Platform commission retained. */
  platformAmount: number;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export type ComputeSplitInput = {
  resolutionType: DisputeResolutionType;
  agreedAmount: number;
  commissionRate?: number;
  /** partial_payout / custom_split: pilot payout amount. */
  pilotAmount?: number | null;
  /** custom_split: client refund amount. */
  clientAmount?: number | null;
};

/**
 * Splits the agreed booking amount for a Super Admin resolution (ledger only):
 * - refund: 100% to client
 * - full_payout: pilot receives agreed minus platform commission (85% at default rate)
 * - partial_payout: pilot receives `pilotAmount`; platform keeps commission (capped);
 *   remainder is refunded to the client
 * - custom_split: explicit pilot + client amounts; remainder is the platform share
 */
export function computeDisputeSplit(
  input: ComputeSplitInput,
): { ok: true; split: DisputeSplit } | { ok: false; error: string } {
  const agreed = round2(input.agreedAmount);
  const rate = input.commissionRate ?? DEFAULT_COMMISSION_RATE;

  switch (input.resolutionType) {
    case "refund":
      return {
        ok: true,
        split: { pilotAmount: 0, clientAmount: agreed, platformAmount: 0 },
      };
    case "full_payout": {
      const platformAmount = round2(agreed * rate);
      return {
        ok: true,
        split: {
          pilotAmount: round2(agreed - platformAmount),
          clientAmount: 0,
          platformAmount,
        },
      };
    }
    case "partial_payout": {
      const pilot = input.pilotAmount;
      if (typeof pilot !== "number" || !Number.isFinite(pilot) || pilot <= 0) {
        return {
          ok: false,
          error: "Partial payout requires a positive pilot payout amount.",
        };
      }
      if (pilot > agreed) {
        return {
          ok: false,
          error: "Payout amount cannot exceed the agreed booking amount.",
        };
      }
      const pilotAmount = round2(pilot);
      const platformAmount = round2(
        Math.min(agreed * rate, agreed - pilotAmount),
      );
      return {
        ok: true,
        split: {
          pilotAmount,
          clientAmount: round2(agreed - pilotAmount - platformAmount),
          platformAmount,
        },
      };
    }
    case "custom_split": {
      const pilot = input.pilotAmount;
      const client = input.clientAmount;
      const valid = (n: unknown): n is number =>
        typeof n === "number" && Number.isFinite(n) && n >= 0;
      if (!valid(pilot) || !valid(client)) {
        return {
          ok: false,
          error: "Custom split requires pilot and client amounts (0 or more).",
        };
      }
      const pilotAmount = round2(pilot);
      const clientAmount = round2(client);
      const platformAmount = round2(agreed - pilotAmount - clientAmount);
      if (platformAmount < 0) {
        return {
          ok: false,
          error: "Pilot and client amounts cannot exceed the agreed booking amount.",
        };
      }
      return { ok: true, split: { pilotAmount, clientAmount, platformAmount } };
    }
    default:
      return { ok: false, error: "Invalid resolution type." };
  }
}
