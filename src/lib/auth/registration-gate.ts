/**
 * Registration gate — closed until moderator/admin dashboard work is signed off.
 * Set REGISTRATION_ENABLED=true (or NEXT_PUBLIC_REGISTRATION_ENABLED=true) to reopen.
 */
export function isRegistrationEnabled(): boolean {
  const server = process.env.REGISTRATION_ENABLED?.trim().toLowerCase();
  const publicFlag = process.env.NEXT_PUBLIC_REGISTRATION_ENABLED?.trim().toLowerCase();
  const value = server ?? publicFlag ?? "false";
  return value === "1" || value === "true" || value === "yes";
}

export const REGISTRATION_CLOSED_MESSAGE =
  "New account registration is temporarily closed while we finish the operator dashboard. Join the waitlist for priority access.";
