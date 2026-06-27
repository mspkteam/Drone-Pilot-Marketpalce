/** Client display names for dashboard shell and welcome copy. */

export function clientFullDisplayName(input: {
  contactName?: string | null;
  companyName?: string | null;
  fallback?: string;
}): string {
  const full =
    input.contactName?.trim() ||
    input.companyName?.trim() ||
    input.fallback?.trim() ||
    "Client";
  return full;
}

export function clientFirstDisplayName(input: {
  contactName?: string | null;
  companyName?: string | null;
  fallback?: string;
}): string {
  const full = clientFullDisplayName(input);
  return full.split(/\s+/)[0] ?? full;
}
