/**
 * Personnel Directory "Role" column — display titles only (not auth roles).
 *
 * Auth roles remain: pilot | client | admin | moderator | super_admin.
 * These labels are computed for the Users table. Rename them here (or later
 * via Super Admin configuration) — keep filters in sync via PERSONNEL_ROLE_FILTERS.
 *
 * Mapping (after v0.27.97):
 * - Squadron Lead  → instructor add-on is active (not merely A-4 eligible)
 * - Elite Pilot    → membership grade A-5 … A-10
 * - Pilot          → other pilots (or their membership plan name when set)
 * - Enterprise Client → client with a company name
 * - Client         → client without a company name
 */

export const PERSONNEL_DISPLAY_ROLE_LABELS = {
  pilot: "Pilot",
  elitePilot: "Elite Pilot",
  /** Active Remote Pilot Instructor add-on — NOT the same as A-4 eligibility alone. */
  squadronLead: "Squadron Lead",
  client: "Client",
  enterpriseClient: "Enterprise Client",
} as const;

export type PersonnelDisplayRoleLabel =
  (typeof PERSONNEL_DISPLAY_ROLE_LABELS)[keyof typeof PERSONNEL_DISPLAY_ROLE_LABELS];

/** Grades shown as Elite Pilot in the directory. */
export const PERSONNEL_ELITE_TIER_CODES = new Set([
  "A5_FIRST_OFFICER",
  "A6_CAPTAIN",
  "A7_SENIOR_CAPTAIN",
  "A8_MASTER_CAPTAIN",
  "A9_FLEET_CAPTAIN",
  "A10_COMMODORE",
]);

export function mapPersonnelPilotRoleLabel(input: {
  tierCode: string | null | undefined;
  /** Active membership plan display name (e.g. "A-4 Senior Flight Officer"). */
  planName?: string | null;
  instructorAddonActive?: boolean;
}): { label: string; filter: string } {
  const labels = PERSONNEL_DISPLAY_ROLE_LABELS;

  if (input.instructorAddonActive) {
    return { label: labels.squadronLead, filter: labels.squadronLead };
  }

  const planName = input.planName?.trim();

  if (input.tierCode && PERSONNEL_ELITE_TIER_CODES.has(input.tierCode)) {
    // Prefer the real grade title (e.g. A-6 Captain) over the Elite Pilot bucket.
    return {
      label: planName || labels.elitePilot,
      filter: labels.elitePilot,
    };
  }

  if (planName) {
    // Grade title is the accurate default; filter still buckets as Pilot.
    return { label: planName, filter: labels.pilot };
  }

  return { label: labels.pilot, filter: labels.pilot };
}

export function mapPersonnelClientRoleLabel(hasCompanyName: boolean): {
  label: string;
  filter: string;
} {
  const labels = PERSONNEL_DISPLAY_ROLE_LABELS;
  if (hasCompanyName) {
    return { label: labels.enterpriseClient, filter: labels.enterpriseClient };
  }
  return { label: labels.client, filter: labels.client };
}
