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
  const symbol = currency === "USD" ? "$" : `${currency} `;
  if (min != null && max != null && min === max) {
    return `${symbol}${min.toLocaleString()}/hr`;
  }
  if (min != null && max != null) {
    return `${symbol}${min.toLocaleString()}–${max.toLocaleString()}/hr`;
  }
  if (min != null) {
    return `From ${symbol}${min.toLocaleString()}/hr`;
  }
  if (max != null) {
    return `Up to ${symbol}${max.toLocaleString()}/hr`;
  }
  return null;
}

export function serviceLabel(id: string): string {
  return PILOT_SERVICE_OPTIONS.find((s) => s.id === id)?.label ?? id;
}

/** Dashboard profile uses miles; DB stores kilometers. */
export function kmToRoundedMiles(km: number): number {
  return Math.round(km / 1.60934);
}

export function formatServiceRadius(km: number | null): string | null {
  if (km == null || !Number.isFinite(km) || km <= 0) return null;
  const miles = kmToRoundedMiles(km);
  return `${miles.toLocaleString()} mi`;
}

export function parseLanguageList(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[,;/|]+/)) {
    const label = part.trim();
    const key = label.toLowerCase();
    if (!label || seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}
