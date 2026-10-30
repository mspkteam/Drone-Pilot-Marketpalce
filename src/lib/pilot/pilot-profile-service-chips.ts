import type { PilotServiceId } from "@/types/pilot";

export type PilotProfileServiceChip = {
  id: string;
  label: string;
  /** Persisted service id when saved to API */
  serviceId?: PilotServiceId;
};

/**
 * Display chips. Prefer a real `serviceId` when one exists.
 * Specialty chips without a unique API id stay in `localChipIds` and are
 * folded into `other` on save via `servicesOfferedForSave`.
 */
export const PILOT_PROFILE_SERVICE_CHIPS: readonly PilotProfileServiceChip[] = [
  { id: "aerial_video", label: "Aerial Video", serviceId: "aerial_video" },
  { id: "photography", label: "Photography" },
  { id: "mapping", label: "Mapping", serviceId: "surveying" },
  { id: "agriculture", label: "Agriculture", serviceId: "agriculture" },
  { id: "real_estate", label: "Real Estate", serviceId: "real_estate" },
  { id: "inspections", label: "Inspections", serviceId: "inspection" },
  { id: "events", label: "Events", serviceId: "events" },
  { id: "thermal", label: "Thermal" },
  { id: "construction", label: "Construction" },
  { id: "emergency", label: "Emergency Response" },
  { id: "custom", label: "Custom Drone Work", serviceId: "other" },
] as const;

/** Ensure specialty-only chip selections still satisfy API onboarding rules. */
export function servicesOfferedForSave(
  servicesOffered: string[],
  localChipIds: string[],
): string[] {
  if (servicesOffered.length > 0) return servicesOffered;
  if (localChipIds.length > 0) return ["other"];
  return [];
}

export function isChipSelected(
  chip: PilotProfileServiceChip,
  servicesOffered: string[],
  localChipIds: string[],
): boolean {
  if (chip.serviceId) {
    return servicesOffered.includes(chip.serviceId);
  }
  return localChipIds.includes(chip.id);
}

/** Labels as shown on the dashboard chips, including extras (thermal, etc.). */
export function publicPilotServiceLabels(
  servicesOffered: string[],
  localChipIds: string[],
): string[] {
  const labels: string[] = [];
  const seen = new Set<string>();
  const push = (label: string) => {
    const key = label.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    labels.push(label.trim());
  };

  for (const chip of PILOT_PROFILE_SERVICE_CHIPS) {
    if (isChipSelected(chip, servicesOffered, localChipIds)) {
      push(chip.label);
    }
  }

  return labels;
}

export function toggleServiceChip(
  chip: PilotProfileServiceChip,
  servicesOffered: string[],
  localChipIds: string[],
): { servicesOffered: string[]; localChipIds: string[] } {
  if (chip.serviceId) {
    const selected = servicesOffered.includes(chip.serviceId);
    const next = selected
      ? servicesOffered.filter((id) => id !== chip.serviceId)
      : [...servicesOffered, chip.serviceId];
    return { servicesOffered: next, localChipIds };
  }

  const selected = localChipIds.includes(chip.id);
  const nextLocal = selected
    ? localChipIds.filter((id) => id !== chip.id)
    : [...localChipIds, chip.id];
  return { servicesOffered, localChipIds: nextLocal };
}
