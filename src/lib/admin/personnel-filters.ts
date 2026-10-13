import { PERSONNEL_DISPLAY_ROLE_LABELS } from "@/lib/admin/personnel-role-labels";

const L = PERSONNEL_DISPLAY_ROLE_LABELS;

export const PERSONNEL_ROLE_FILTERS = [
  "All roles",
  "All pilots",
  "All clients",
  L.pilot,
  L.elitePilot,
  L.squadronLead,
  L.client,
  L.enterpriseClient,
] as const;

export const PERSONNEL_REGION_FILTERS = [
  "Global",
  "North America",
  "Western Europe",
  "Asia Pacific",
  "Middle East",
  "Africa",
  "Latin America",
] as const;
