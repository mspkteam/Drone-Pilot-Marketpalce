/** Map hourly pilot rates to Figma-style day-rate copy (8-hour day assumption). */
export function formatPilotDayRate(
  hourlyRateMin: number | null,
  hourlyRateMax: number | null,
): string {
  if (hourlyRateMin != null) {
    const dayRate = Math.round(hourlyRateMin * 8);
    return `$${dayRate.toLocaleString("en-US")}/day`;
  }
  if (hourlyRateMax != null) {
    return `$${Math.round(hourlyRateMax * 8).toLocaleString("en-US")}/day`;
  }
  return "Rate on request";
}

export function formatPilotDayRateLabel(
  hourlyRateMin: number | null,
  hourlyRateMax: number | null,
): string {
  const rate = formatPilotDayRate(hourlyRateMin, hourlyRateMax);
  return rate === "Rate on request" ? rate : `from ${rate}`;
}
