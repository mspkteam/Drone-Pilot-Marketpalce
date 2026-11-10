/**
 * Testing-phase instant hard-delete gate.
 *
 * Enable with either:
 * - ALLOW_TEST_INSTANT_DELETE=true  → URL ?instantDelete=1&deleteUser=email@example.com
 * - TEST_INSTANT_DELETE_TOKEN=secret → URL ?instantDelete=secret&deleteUser=email@example.com
 *
 * Only the signed-in pilot/client whose email exactly matches `deleteUser` is deleted.
 */
export function isTestInstantDeleteEnabled(): boolean {
  return (
    process.env.ALLOW_TEST_INSTANT_DELETE === "true" ||
    Boolean(process.env.TEST_INSTANT_DELETE_TOKEN?.trim())
  );
}

export function isValidTestInstantDeleteParam(
  value: string | null | undefined,
): boolean {
  if (!value) return false;
  const token = process.env.TEST_INSTANT_DELETE_TOKEN?.trim();
  if (token && value === token) return true;
  if (process.env.ALLOW_TEST_INSTANT_DELETE === "true" && value === "1") {
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
