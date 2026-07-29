/**
 * Percent-based overlay layouts for client-provided certificate PNG templates.
 * Coordinates are percentages of image width/height (0–100), top-left origin.
 */

import {
  isCertificateFontKey,
  migrateLegacyFontRole,
  type CertificateFontKey,
} from "@/lib/certificates/fonts";

export type CertificateOverlayField =
  | "pilotName"
  | "gradeOrTitle"
  | "issuedAt"
  | "awardDateShort"
  | "certificateNumber"
  | "memberNumber"
  | "day"
  | "month"
  | "year";

export const ALL_OVERLAY_FIELDS: CertificateOverlayField[] = [
  "pilotName",
  "gradeOrTitle",
  "issuedAt",
  "awardDateShort",
  "certificateNumber",
  "memberNumber",
  "day",
  "month",
  "year",
];

export type CertificateFieldStyle = {
  field: CertificateOverlayField;
  /** Horizontal center of the text block as % of width */
  x: number;
  /** Vertical center of the text baseline area as % of height */
  y: number;
  /** Max width of text block as % of image width */
  maxWidth?: number;
  fontSize: number;
  /** Named client font */
  font: CertificateFontKey;
  align?: "center" | "left" | "right";
  weight?: "normal" | "bold";
  letterSpacing?: number;
  uppercase?: boolean;
};

export type CertificateLayout = {
  key: string;
  orientation: "landscape" | "portrait";
  width: number;
  height: number;
  fields: CertificateFieldStyle[];
};

/** Shared Form 275 wings award family (Aviator / Senior / Master). */
const WINGS_AWARD_LAYOUT: Omit<CertificateLayout, "key"> = {
  orientation: "landscape",
  width: 3300,
  height: 2550,
  fields: [
    {
      field: "pilotName",
      x: 50,
      y: 38,
      maxWidth: 70,
      fontSize: 56,
      font: "colchester",
      align: "center",
    },
    {
      field: "memberNumber",
      x: 78,
      y: 86,
      maxWidth: 12,
      fontSize: 14,
      font: "arial",
      align: "left",
    },
    {
      field: "awardDateShort",
      x: 90,
      y: 86,
      maxWidth: 12,
      fontSize: 14,
      font: "arial",
      align: "left",
    },
    {
      field: "certificateNumber",
      x: 88,
      y: 94,
      maxWidth: 22,
      fontSize: 12,
      font: "engravers",
      align: "right",
      uppercase: true,
    },
  ],
};

export const CERTIFICATE_LAYOUTS: Record<string, CertificateLayout> = {
  "recreational-pilot-wings": {
    key: "recreational-pilot-wings",
    orientation: "landscape",
    width: 3300,
    height: 2550,
    fields: [
      {
        field: "pilotName",
        x: 50,
        y: 52,
        maxWidth: 70,
        fontSize: 64,
        font: "colchester",
        align: "center",
      },
      {
        field: "issuedAt",
        x: 50,
        y: 78,
        maxWidth: 50,
        fontSize: 20,
        font: "arial",
        align: "center",
        uppercase: true,
      },
      {
        field: "certificateNumber",
        x: 18,
        y: 92,
        maxWidth: 40,
        fontSize: 16,
        font: "engravers",
        align: "left",
        uppercase: true,
      },
    ],
  },
  "certificate-of-promotion": {
    key: "certificate-of-promotion",
    orientation: "landscape",
    width: 3300,
    height: 2550,
    fields: [
      {
        field: "pilotName",
        x: 50,
        y: 48,
        maxWidth: 70,
        fontSize: 72,
        font: "harrowgate",
        align: "center",
      },
      {
        field: "gradeOrTitle",
        x: 50,
        y: 62,
        maxWidth: 60,
        fontSize: 56,
        font: "colchester",
        align: "center",
      },
      {
        field: "certificateNumber",
        x: 22,
        y: 88,
        maxWidth: 35,
        fontSize: 16,
        font: "arial",
        align: "left",
      },
    ],
  },
  "captain-promotion": {
    key: "captain-promotion",
    orientation: "portrait",
    width: 2593,
    height: 3300,
    fields: [
      {
        field: "pilotName",
        x: 50,
        y: 32,
        maxWidth: 75,
        fontSize: 52,
        font: "colchester",
        align: "center",
      },
      {
        field: "gradeOrTitle",
        x: 50,
        y: 42,
        maxWidth: 60,
        fontSize: 48,
        font: "engravers",
        align: "center",
        weight: "bold",
        uppercase: true,
      },
      {
        field: "day",
        x: 32,
        y: 68,
        maxWidth: 12,
        fontSize: 16,
        font: "harrowgate",
        align: "center",
      },
      {
        field: "month",
        x: 48,
        y: 68,
        maxWidth: 18,
        fontSize: 16,
        font: "harrowgate",
        align: "center",
      },
      {
        field: "year",
        x: 62,
        y: 68,
        maxWidth: 10,
        fontSize: 16,
        font: "harrowgate",
        align: "center",
      },
    ],
  },
  "aviator-wings": {
    key: "aviator-wings",
    ...WINGS_AWARD_LAYOUT,
  },
  "senior-aviator-wings": {
    key: "senior-aviator-wings",
    ...WINGS_AWARD_LAYOUT,
  },
  "master-aviator-wings": {
    key: "master-aviator-wings",
    ...WINGS_AWARD_LAYOUT,
  },
  /** Generic layout for admin-uploaded custom certificate backgrounds. */
  custom: {
    key: "custom",
    orientation: "landscape",
    width: 3300,
    height: 2550,
    fields: [
      {
        field: "pilotName",
        x: 50,
        y: 52,
        maxWidth: 70,
        fontSize: 56,
        font: "colchester",
        align: "center",
      },
      {
        field: "gradeOrTitle",
        x: 50,
        y: 62,
        maxWidth: 60,
        fontSize: 36,
        font: "engravers",
        align: "center",
        weight: "bold",
      },
      {
        field: "issuedAt",
        x: 50,
        y: 78,
        maxWidth: 50,
        fontSize: 20,
        font: "arial",
        align: "center",
        uppercase: true,
      },
      {
        field: "certificateNumber",
        x: 12,
        y: 92,
        maxWidth: 40,
        fontSize: 14,
        font: "arial",
        align: "left",
        uppercase: true,
      },
    ],
  },
};

export function getCertificateLayout(
  layoutKey: string | null | undefined,
): CertificateLayout | null {
  if (!layoutKey) return null;
  return CERTIFICATE_LAYOUTS[layoutKey] ?? CERTIFICATE_LAYOUTS.custom ?? null;
}

export type OverlayFieldOverride = {
  field: CertificateOverlayField;
  x: number;
  y: number;
  fontSize?: number;
  align?: "center" | "left" | "right";
  maxWidth?: number;
  font?: CertificateFontKey;
  weight?: "normal" | "bold";
};

/** @deprecated alias — use OverlayFieldOverride */
export type OverlayPositionOverride = OverlayFieldOverride;

function parseFont(value: unknown): CertificateFontKey | undefined {
  const migrated = migrateLegacyFontRole(value);
  return migrated ?? undefined;
}

export function parseOverlayPositionsJson(
  raw: string | null | undefined,
): OverlayFieldOverride[] | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const out: OverlayFieldOverride[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      const field = rec.field;
      const x = Number(rec.x);
      const y = Number(rec.y);
      if (typeof field !== "string" || !Number.isFinite(x) || !Number.isFinite(y)) {
        continue;
      }
      if (!(ALL_OVERLAY_FIELDS as string[]).includes(field)) continue;
      const override: OverlayFieldOverride = {
        field: field as CertificateOverlayField,
        x: Math.min(100, Math.max(0, x)),
        y: Math.min(100, Math.max(0, y)),
      };
      if (rec.fontSize != null && Number.isFinite(Number(rec.fontSize))) {
        override.fontSize = Math.min(200, Math.max(6, Number(rec.fontSize)));
      }
      if (rec.align === "left" || rec.align === "center" || rec.align === "right") {
        override.align = rec.align;
      }
      if (rec.maxWidth != null && Number.isFinite(Number(rec.maxWidth))) {
        override.maxWidth = Math.min(100, Math.max(5, Number(rec.maxWidth)));
      }
      const font = parseFont(rec.font);
      if (font) override.font = font;
      if (rec.weight === "bold" || rec.weight === "normal") {
        override.weight = rec.weight;
      }
      out.push(override);
    }
    return out.length ? out : null;
  } catch {
    return null;
  }
}

export function sanitizeOverlayOverrides(
  positions: OverlayFieldOverride[] | null | undefined,
): OverlayFieldOverride[] | null {
  if (!positions?.length) return null;
  const out: OverlayFieldOverride[] = [];
  for (const item of positions) {
    if (!item?.field || !Number.isFinite(item.x) || !Number.isFinite(item.y)) {
      continue;
    }
    if (!(ALL_OVERLAY_FIELDS as string[]).includes(item.field)) continue;
    const entry: OverlayFieldOverride = {
      field: item.field,
      x: Math.min(100, Math.max(0, item.x)),
      y: Math.min(100, Math.max(0, item.y)),
    };
    if (item.fontSize != null && Number.isFinite(item.fontSize)) {
      entry.fontSize = Math.min(200, Math.max(6, item.fontSize));
    }
    if (item.align === "left" || item.align === "center" || item.align === "right") {
      entry.align = item.align;
    }
    if (item.maxWidth != null && Number.isFinite(item.maxWidth)) {
      entry.maxWidth = Math.min(100, Math.max(5, item.maxWidth));
    }
    if (item.font && isCertificateFontKey(item.font)) {
      entry.font = item.font;
    } else if (item.font) {
      const migrated = migrateLegacyFontRole(item.font);
      if (migrated) entry.font = migrated;
    }
    if (item.weight === "bold" || item.weight === "normal") {
      entry.weight = item.weight;
    }
    out.push(entry);
  }
  return out.length ? out : null;
}

export function serializeOverlayPositions(
  positions: OverlayFieldOverride[] | null | undefined,
): string | null {
  if (!positions?.length) return null;
  return JSON.stringify(
    positions.map((p) => {
      const entry: Record<string, string | number> = {
        field: p.field,
        x: Math.round(p.x * 100) / 100,
        y: Math.round(p.y * 100) / 100,
      };
      if (p.fontSize != null) entry.fontSize = Math.round(p.fontSize);
      if (p.align) entry.align = p.align;
      if (p.maxWidth != null) entry.maxWidth = Math.round(p.maxWidth);
      if (p.font) entry.font = p.font;
      if (p.weight) entry.weight = p.weight;
      return entry;
    }),
  );
}

function mergeFieldWithOverride(
  base: CertificateFieldStyle,
  override: OverlayFieldOverride,
): CertificateFieldStyle {
  return {
    ...base,
    x: override.x,
    y: override.y,
    ...(override.fontSize != null ? { fontSize: override.fontSize } : {}),
    ...(override.align ? { align: override.align } : {}),
    ...(override.maxWidth != null ? { maxWidth: override.maxWidth } : {}),
    ...(override.font ? { font: override.font } : {}),
    ...(override.weight ? { weight: override.weight } : {}),
  };
}

const DEFAULT_FIELD_STYLE: Omit<CertificateFieldStyle, "field" | "x" | "y"> = {
  maxWidth: 40,
  fontSize: 24,
  font: "arial",
  align: "center",
};

function styleFromOverride(override: OverlayFieldOverride): CertificateFieldStyle {
  return {
    field: override.field,
    x: override.x,
    y: override.y,
    maxWidth: override.maxWidth ?? DEFAULT_FIELD_STYLE.maxWidth,
    fontSize: override.fontSize ?? DEFAULT_FIELD_STYLE.fontSize,
    font: override.font ?? DEFAULT_FIELD_STYLE.font,
    align: override.align ?? "center",
    weight: override.weight,
  };
}

/**
 * Apply saved overlays onto a base layout.
 * When overrides exist they are the authoritative field list (builder checklist).
 */
export function applyOverlayPositionOverrides(
  layout: CertificateLayout,
  overrides: OverlayFieldOverride[] | null | undefined,
): CertificateLayout {
  if (!overrides?.length) return layout;
  const byBase = new Map(layout.fields.map((f) => [f.field, f]));
  const fields: CertificateFieldStyle[] = overrides.map((o) => {
    const base = byBase.get(o.field);
    return base ? mergeFieldWithOverride(base, o) : styleFromOverride(o);
  });
  return { ...layout, fields };
}

export function overridesFromLayoutFields(
  fields: CertificateFieldStyle[],
): OverlayFieldOverride[] {
  return fields.map((f) => ({
    field: f.field,
    x: f.x,
    y: f.y,
    fontSize: f.fontSize,
    align: f.align,
    maxWidth: f.maxWidth,
    font: f.font,
    weight: f.weight,
  }));
}

/** @deprecated — use overridesFromLayoutFields */
export function positionsFromLayoutFields(
  fields: CertificateFieldStyle[],
): OverlayFieldOverride[] {
  return overridesFromLayoutFields(fields);
}

export function getEffectiveFieldOverrides(
  baseLayout: CertificateLayout,
  saved: OverlayFieldOverride[] | null | undefined,
): OverlayFieldOverride[] {
  if (saved?.length) {
    const byBase = new Map(baseLayout.fields.map((f) => [f.field, f]));
    return saved.map((o) => {
      const base = byBase.get(o.field);
      return {
        field: o.field,
        x: o.x,
        y: o.y,
        fontSize: o.fontSize ?? base?.fontSize ?? 24,
        align: o.align ?? base?.align ?? ("center" as const),
        maxWidth: o.maxWidth ?? base?.maxWidth ?? 40,
        font: o.font ?? base?.font ?? ("arial" as const),
        weight: o.weight ?? base?.weight,
      };
    });
  }
  return overridesFromLayoutFields(baseLayout.fields);
}

export function updateFieldOverride(
  baseLayout: CertificateLayout,
  current: OverlayFieldOverride[] | null | undefined,
  field: CertificateOverlayField,
  patch: Partial<Omit<OverlayFieldOverride, "field">>,
): OverlayFieldOverride[] {
  const effective = getEffectiveFieldOverrides(baseLayout, current);
  if (!effective.some((item) => item.field === field)) {
    return [
      ...effective,
      {
        field,
        x: patch.x ?? 50,
        y: patch.y ?? 50,
        fontSize: patch.fontSize ?? 24,
        align: patch.align ?? "center",
        maxWidth: patch.maxWidth ?? 40,
        font: patch.font ?? "arial",
        weight: patch.weight,
      },
    ];
  }
  return effective.map((item) =>
    item.field === field ? { ...item, ...patch, field } : item,
  );
}

export function setActiveOverlayFields(
  baseLayout: CertificateLayout,
  current: OverlayFieldOverride[] | null | undefined,
  activeFields: CertificateOverlayField[],
): OverlayFieldOverride[] {
  const effective = getEffectiveFieldOverrides(baseLayout, current);
  const byField = new Map(effective.map((o) => [o.field, o]));
  const defaults = overridesFromLayoutFields(baseLayout.fields);
  const defaultByField = new Map(defaults.map((o) => [o.field, o]));

  return activeFields.map((field, index) => {
    const existing = byField.get(field);
    if (existing) return existing;
    const fromDefault = defaultByField.get(field);
    if (fromDefault) return fromDefault;
    return {
      field,
      x: 50,
      y: 40 + index * 8,
      fontSize: 24,
      align: "center" as const,
      maxWidth: 40,
      font: "arial" as const,
    };
  });
}

export const OVERLAY_FIELD_LABELS: Record<CertificateOverlayField, string> = {
  pilotName: "Pilot name",
  gradeOrTitle: "Grade / rank",
  issuedAt: "Issue date",
  awardDateShort: "Award date",
  certificateNumber: "Certificate #",
  memberNumber: "Member #",
  day: "Day",
  month: "Month",
  year: "Year",
};

export type CertificateOverlayValues = {
  pilotName: string;
  gradeOrTitle?: string;
  certificateNumber: string;
  memberNumber?: string;
  issuedAt: Date;
};

export function resolveOverlayText(
  field: CertificateOverlayField,
  values: CertificateOverlayValues,
): string {
  const issued = values.issuedAt;
  switch (field) {
    case "pilotName":
      return values.pilotName || "[MEMBER NAME]";
    case "gradeOrTitle":
      return values.gradeOrTitle?.trim() || "[GRADE]";
    case "certificateNumber": {
      // Background artwork already prints “CERTIFICATE NO.” — overlay is digits only.
      if (!values.certificateNumber) return "000075";
      const short =
        values.certificateNumber.replace(/^DPM-\d+-/, "").replace(/^0+/, "") ||
        values.certificateNumber;
      return short;
    }
    case "memberNumber": {
      const num = values.memberNumber?.trim();
      if (num) return num.startsWith("#") ? num : `# ${num}`;
      return "#";
    }
    case "issuedAt":
      return issued
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
        .toUpperCase();
    case "awardDateShort":
      return formatShortAwardDate(issued);
    case "day":
      return String(issued.getDate());
    case "month":
      return issued.toLocaleDateString("en-US", { month: "long" });
    case "year":
      return String(issued.getFullYear()).slice(-2);
    default:
      return "";
  }
}

/** Compact short date for wings RAS member line (MM/DD/YY). */
export function formatShortAwardDate(issuedAt: Date): string {
  const mm = String(issuedAt.getMonth() + 1).padStart(2, "0");
  const dd = String(issuedAt.getDate()).padStart(2, "0");
  const yy = String(issuedAt.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}
