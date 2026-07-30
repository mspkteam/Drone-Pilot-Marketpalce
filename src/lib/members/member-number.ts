/**
 * Platform RAS member numbers — 6-digit numeric IDs for pilots and clients.
 * First account: 001000, then 001001, …
 */

export const MEMBER_NUMBER_START = 1000;
export const MEMBER_NUMBER_WIDTH = 6;

export function formatMemberNumber(value: number | string): string {
  const digits = String(value).replace(/\D/g, "");
  const n = digits ? Number.parseInt(digits, 10) : NaN;
  if (!Number.isFinite(n) || n < 0) {
    return String(MEMBER_NUMBER_START).padStart(MEMBER_NUMBER_WIDTH, "0");
  }
  return String(n).padStart(MEMBER_NUMBER_WIDTH, "0");
}

export function parseMemberNumber(value: string | null | undefined): number | null {
  if (!value?.trim()) return null;
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) ? n : null;
}

/** True when the string looks like a platform member number (not a name/license slug). */
export function looksLikeMemberNumber(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  return /^\d{4,8}$/.test(value.trim().replace(/^#\s*/, ""));
}
