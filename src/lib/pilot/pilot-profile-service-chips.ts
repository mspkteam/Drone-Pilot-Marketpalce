import type { PilotServiceId } from "@/types/pilot";

export type PilotProfileServiceChip = {
  id: string;
  label: string;
  /** Persisted service id when saved to API */
  serviceId?: PilotServiceId;
};

/** Display chips — maps to `PILOT_SERVICE_OPTIONS` where possible. */
export const PILOT_PROFILE_SERVICE_CHIPS: readonly PilotProfileServiceChip[] = [
  { id: "aerial_video", label: "Aerial Video", serviceId: "aerial_video" },
  { id: "photography", label: "Photography", serviceId: "aerial_video" },
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
