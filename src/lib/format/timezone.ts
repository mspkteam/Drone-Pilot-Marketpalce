/** Platform default when the user has no resolvable operating region. */
export const PLATFORM_DEFAULT_TIMEZONE = "America/Chicago";

/** Seeded OperatingRegion.code → IANA timezone (mirrors admin region defaults). */
export const REGION_CODE_TIMEZONES: Record<string, string> = {
  "north-america": "America/Chicago",
  "latin-america": "America/Sao_Paulo",
  "western-europe": "Europe/London",
  "eastern-europe": "Europe/Warsaw",
  "middle-east": "Asia/Dubai",
  africa: "Africa/Johannesburg",
  "asia-pacific": "Asia/Singapore",
  oceania: "Pacific/Auckland",
};

const REGION_NAME_ALIASES: Array<{ match: RegExp; code: string }> = [
  { match: /\bnorth\s*america\b|\busa\b|\bunited states\b|\bcanada\b/i, code: "north-america" },
  {
    match: /\blatin\s*america\b|\bsouth\s*america\b|\bbrazil\b|\bmexico\b/i,
    code: "latin-america",
  },
  { match: /\bwestern\s*europe\b|\buk\b|\bunited kingdom\b|\beurope\b/i, code: "western-europe" },
  { match: /\beastern\s*europe\b|\bpoland\b|\bukraine\b/i, code: "eastern-europe" },
  { match: /\bmiddle\s*east\b|\bdubai\b|\buæ\b|\bu\.?a\.?e\.?\b/i, code: "middle-east" },
  { match: /\bafrica\b|\bsouth africa\b/i, code: "africa" },
  {
    match: /\basia[\s-]*pacific\b|\bsingapore\b|\bjapan\b|\bindia\b|\bchina\b/i,
    code: "asia-pacific",
  },
  { match: /\boceania\b|\baustralia\b|\bnew zealand\b/i, code: "oceania" },
];

/** ISO 3166-1 alpha-2 (and common aliases) → OperatingRegion.code */
const COUNTRY_TO_REGION: Record<string, string> = {
  US: "north-america",
  USA: "north-america",
  CA: "north-america",
  CAN: "north-america",
  MX: "latin-america",
  BR: "latin-america",
  AR: "latin-america",
  CL: "latin-america",
  CO: "latin-america",
  PE: "latin-america",
  GB: "western-europe",
  UK: "western-europe",
  IE: "western-europe",
  FR: "western-europe",
  DE: "western-europe",
  ES: "western-europe",
  PT: "western-europe",
  NL: "western-europe",
  BE: "western-europe",
  IT: "western-europe",
  CH: "western-europe",
  AT: "western-europe",
  PL: "eastern-europe",
  CZ: "eastern-europe",
  RO: "eastern-europe",
  HU: "eastern-europe",
  UA: "eastern-europe",
  SK: "eastern-europe",
  BG: "eastern-europe",
  AE: "middle-east",
  SA: "middle-east",
  QA: "middle-east",
  KW: "middle-east",
  BH: "middle-east",
  OM: "middle-east",
  IL: "middle-east",
  JO: "middle-east",
  EG: "africa",
  ZA: "africa",
  NG: "africa",
  KE: "africa",
  MA: "africa",
  SG: "asia-pacific",
  JP: "asia-pacific",
  KR: "asia-pacific",
  CN: "asia-pacific",
  IN: "asia-pacific",
  TH: "asia-pacific",
  MY: "asia-pacific",
  PH: "asia-pacific",
  ID: "asia-pacific",
  VN: "asia-pacific",
  HK: "asia-pacific",
  TW: "asia-pacific",
  AU: "oceania",
  NZ: "oceania",
  FJ: "oceania",
};

export function isValidTimeZone(timeZone: string | null | undefined): boolean {
  if (!timeZone?.trim()) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timeZone.trim() });
    return true;
  } catch {
    return false;
  }
}

export function normalizeTimeZone(
  timeZone: string | null | undefined,
  fallback = PLATFORM_DEFAULT_TIMEZONE,
): string {
  const trimmed = timeZone?.trim();
  if (trimmed && isValidTimeZone(trimmed)) return trimmed;
  return fallback;
}

export function timezoneForRegionCode(
  code: string | null | undefined,
  regionTimezones?: Record<string, string>,
): string | null {
  if (!code?.trim()) return null;
  const key = code.trim().toLowerCase();
  const fromDb = regionTimezones?.[key];
  if (fromDb && isValidTimeZone(fromDb)) return fromDb;
  const seeded = REGION_CODE_TIMEZONES[key];
  return seeded && isValidTimeZone(seeded) ? seeded : null;
}

/** Prefer earliest sortOrder among selected region codes. */
export function pickTimezoneFromRegionCodes(
  codes: string[],
  regionRows: Array<{ code: string; timezone: string; sortOrder: number }>,
): string | null {
  if (!codes.length) return null;
  const wanted = new Set(codes.map((c) => c.trim().toLowerCase()).filter(Boolean));
  if (!wanted.size) return null;

  const matched = regionRows
    .filter((r) => wanted.has(r.code.trim().toLowerCase()))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code));

  for (const row of matched) {
    const tz = normalizeTimeZone(row.timezone, "");
    if (tz) return tz;
  }

  for (const code of codes) {
    const tz = timezoneForRegionCode(code);
    if (tz) return tz;
  }
  return null;
}

export function regionCodeFromCountry(
  country: string | null | undefined,
): string | null {
  if (!country?.trim()) return null;
  const raw = country.trim();
  const upper = raw.toUpperCase();
  if (COUNTRY_TO_REGION[upper]) return COUNTRY_TO_REGION[upper];

  // Full country names → region via aliases
  for (const entry of REGION_NAME_ALIASES) {
    if (entry.match.test(raw)) return entry.code;
  }
  return null;
}

export function timezoneFromCountry(
  country: string | null | undefined,
  regionTimezones?: Record<string, string>,
): string | null {
  return timezoneForRegionCode(regionCodeFromCountry(country), regionTimezones);
}

/** Match free-text area (e.g. client typicalProjectArea) to a region timezone. */
export function timezoneFromAreaLabel(
  label: string | null | undefined,
  regionTimezones?: Record<string, string>,
): string | null {
  if (!label?.trim()) return null;
  const text = label.trim();
  const asCode = text.toLowerCase().replace(/\s+/g, "-");
  const direct = timezoneForRegionCode(asCode, regionTimezones);
  if (direct) return direct;

  for (const entry of REGION_NAME_ALIASES) {
    if (entry.match.test(text)) {
      return timezoneForRegionCode(entry.code, regionTimezones);
    }
  }
  return null;
}
