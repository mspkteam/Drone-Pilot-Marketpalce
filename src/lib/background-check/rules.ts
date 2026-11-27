import {
  BACKGROUND_CHECK_STATUSES,
  type BackgroundCheckStatus,
} from "@/types/background-check";

/** $20 one-time manual background check fee (RAS Payment v6). */
export const BACKGROUND_CHECK_FEE_USD = 20;
export const BACKGROUND_CHECK_FEE_CENTS = BACKGROUND_CHECK_FEE_USD * 100;

/** Days from admin profile acceptance to get cleared before marketplace pause. */
export const BACKGROUND_CHECK_DEADLINE_DAYS = 30;

/**
 * Feature launch date. Pilots approved before the feature existed (no record
 * with `deadlineStartedAt`) get their 30 days counted from here.
 */
export const BACKGROUND_CHECK_LAUNCH_DATE = new Date("2026-11-27T00:00:00.000Z");

const DAY_MS = 24 * 60 * 60 * 1000;

export function isBackgroundCheckStatus(
  value: unknown,
): value is BackgroundCheckStatus {
  return (
    typeof value === "string" &&
    (BACKGROUND_CHECK_STATUSES as readonly string[]).includes(value)
  );
}

/** Start of the 30-day window: admin acceptance date, else the launch constant. */
export function resolveDeadlineStart(
  deadlineStartedAt: Date | null | undefined,
  launchDate: Date = BACKGROUND_CHECK_LAUNCH_DATE,
): Date {
  return deadlineStartedAt ?? launchDate;
}

export function computeBackgroundCheckDeadline(
  deadlineStartedAt: Date | null | undefined,
  launchDate: Date = BACKGROUND_CHECK_LAUNCH_DATE,
): Date {
  const start = resolveDeadlineStart(deadlineStartedAt, launchDate);
  return new Date(start.getTime() + BACKGROUND_CHECK_DEADLINE_DAYS * DAY_MS);
}

/** Whole days left (ceil); 0 when the deadline has passed. */
export function daysUntilDeadline(deadline: Date, now: Date = new Date()): number {
  const diff = deadline.getTime() - now.getTime();
  return diff <= 0 ? 0 : Math.ceil(diff / DAY_MS);
}

export type BackgroundCheckGateInput = {
  status: string | null | undefined;
  deadlineStartedAt?: Date | null;
  now?: Date;
  launchDate?: Date;
};

/**
 * Marketplace is paused (no proposals / hire) when the pilot is not cleared and
 * either the 30-day window is over or admin marked them not_cleared.
 */
export function isMarketplacePausedByBackgroundCheck(
  input: BackgroundCheckGateInput,
): boolean {
  const status = input.status ?? "not_started";
  if (status === "cleared") return false;
  if (status === "not_cleared") return true;
  const deadline = computeBackgroundCheckDeadline(
    input.deadlineStartedAt,
    input.launchDate,
  );
  return (input.now ?? new Date()).getTime() > deadline.getTime();
}

export const BACKGROUND_CHECK_PAUSED_MESSAGE =
  "Your marketplace access is paused until your background check is cleared. Open Background Check in your dashboard.";

export type CanPayInput = {
  profileApproved: boolean;
  hasActiveMembership: boolean;
  status: string | null | undefined;
  consentAccepted: boolean;
};

export function getBackgroundCheckPayBlockReason(
  input: CanPayInput,
): string | null {
  if (!input.profileApproved) {
    return "Your pilot profile must be approved by an admin first.";
  }
  if (!input.hasActiveMembership) {
    return "An active membership is required before the background check.";
  }
  if ((input.status ?? "not_started") !== "not_started") {
    return "Background check fee already paid.";
  }
  if (!input.consentAccepted) {
    return "You must consent to the background check before paying.";
  }
  return null;
}

/** Statuses an admin may set manually (paid is system-set via payment). */
export const ADMIN_SETTABLE_STATUSES = [
  "paid",
  "in_review",
  "cleared",
  "not_cleared",
] as const satisfies readonly BackgroundCheckStatus[];

export function isAdminSettableStatus(
  value: unknown,
): value is (typeof ADMIN_SETTABLE_STATUSES)[number] {
  return (
    typeof value === "string" &&
    (ADMIN_SETTABLE_STATUSES as readonly string[]).includes(value)
  );
}
