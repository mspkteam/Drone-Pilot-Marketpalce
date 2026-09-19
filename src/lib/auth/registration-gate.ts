/**
 * Registration gate — open by default so new client/pilot accounts can be created.
 * Set REGISTRATION_ENABLED=false (or NEXT_PUBLIC_REGISTRATION_ENABLED=false) to pause signups.
 */
export function isRegistrationEnabled(): boolean {
  const server = process.env.REGISTRATION_ENABLED?.trim().toLowerCase();
  const publicFlag = process.env.NEXT_PUBLIC_REGISTRATION_ENABLED?.trim().toLowerCase();
  const value = server ?? publicFlag;
  if (value == null || value === "") return true;
  if (["0", "false", "no", "off"].includes(value)) return false;
  return value === "1" || value === "true" || value === "yes";
}

export const REGISTRATION_CLOSED_MESSAGE =
  "New account registration is temporarily closed. Join the waitlist for priority access, or contact support if you already have an invite.";
