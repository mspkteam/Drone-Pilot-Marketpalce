/**
 * Testing-phase instant hard-delete gate.
 *
 * Enable with either:
 * - ALLOW_TEST_INSTANT_DELETE=true  → URL ?instantDelete=1&deleteUser=email@example.com
 * - TEST_INSTANT_DELETE_TOKEN=secret → URL ?instantDelete=secret&deleteUser=email@example.com
 * - Local `next dev` always allows `instantDelete=1` (no env required).
 *
 * Only the signed-in pilot/client whose email exactly matches `deleteUser` is deleted.
 */

function envFlagEnabled(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes" ||
    normalized === "on"
  );
}

export function isTestInstantDeleteEnabled(): boolean {
  if (envFlagEnabled(process.env.ALLOW_TEST_INSTANT_DELETE)) return true;
  if (process.env.TEST_INSTANT_DELETE_TOKEN?.trim()) return true;
  // Local QA convenience — Production/Preview still require an explicit flag/token.
  if (process.env.NODE_ENV === "development") return true;
  return false;
}

export function isValidTestInstantDeleteParam(
  value: string | null | undefined,
): boolean {
  if (!value) return false;
  const token = process.env.TEST_INSTANT_DELETE_TOKEN?.trim();
  if (token && value === token) return true;
  if (
    value === "1" &&
    (envFlagEnabled(process.env.ALLOW_TEST_INSTANT_DELETE) ||
      process.env.NODE_ENV === "development")
  ) {
    return true;
  }
  return false;
}

export function normalizeTestDeleteEmail(
  value: string | null | undefined,
): string | null {
  const email = value?.trim().toLowerCase();
  return email || null;
}

export function emailsMatchForTestDelete(
  sessionEmail: string | null | undefined,
  deleteUserEmail: string | null | undefined,
): boolean {
  const a = normalizeTestDeleteEmail(sessionEmail);
  const b = normalizeTestDeleteEmail(deleteUserEmail);
  return Boolean(a && b && a === b);
}
