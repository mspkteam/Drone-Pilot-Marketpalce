import { PILOT_SERVICE_OPTIONS } from "@/types/pilot";

export function formatPilotLocation(
  city: string | null,
  region: string | null,
  country: string | null,
): string {
  return [city, region, country].filter(Boolean).join(", ") || "Location not set";
}

export function formatPilotRateRange(
  min: number | null,
  max: number | null,
  currency = "USD",
): string | null {
  if (min != null && max != null) {
    return `${currency} ${min.toLocaleString()}–${max.toLocaleString()}/hr`;
  }
  if (min != null) {
    return `From ${currency} ${min.toLocaleString()}/hr`;
  }
  if (max != null) {
    return `Up to ${currency} ${max.toLocaleString()}/hr`;
  }
  return null;
}

export function serviceLabel(id: string): string {
  return PILOT_SERVICE_OPTIONS.find((s) => s.id === id)?.label ?? id;
}
