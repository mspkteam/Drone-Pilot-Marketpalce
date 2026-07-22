/**
 * Percent-based overlay layouts for client-provided certificate PNG templates.
 * Coordinates are percentages of image width/height (0–100), top-left origin.
 */

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

export type CertificateFieldStyle = {
  field: CertificateOverlayField;
  /** Horizontal center of the text block as % of width */
  x: number;
  /** Vertical center of the text baseline area as % of height */
  y: number;
  /** Max width of text block as % of image width */
  maxWidth?: number;
  fontSize: number;
  /** CSS/PDF font role */
  font: "blackletter" | "serif" | "sans" | "script";
  align?: "center" | "left" | "right";
  weight?: "normal" | "bold";
  letterSpacing?: number;
  uppercase?: boolean;
};

export type CertificateLayout = {
  key: string;
  /** Aspect hint for preview / PDF page size */
  orientation: "landscape" | "portrait";
  /** Intrinsic pixel size of the source PNG (for PDF scaling) */
  width: number;
  height: number;
  fields: CertificateFieldStyle[];
};

const WINGS_AWARD_LAYOUT: Omit<CertificateLayout, "key"> = {
  orientation: "landscape",
  width: 1024,
  height: 804,
  fields: [
    {
      field: "pilotName",
      x: 50,
      y: 42,
      maxWidth: 70,
      fontSize: 28,
      font: "blackletter",
      align: "center",
    },
    {
      field: "memberNumber",
      x: 72,
      y: 86,
      maxWidth: 14,
      fontSize: 11,
      font: "sans",
      align: "left",
    },
    {
      field: "awardDateShort",
      x: 86,
      y: 86,
      maxWidth: 14,
      fontSize: 11,
      font: "sans",
      align: "left",
    },
    {
      field: "certificateNumber",
      x: 88,
      y: 94,
      maxWidth: 22,
      fontSize: 9,
      font: "sans",
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
        y: 58,
        maxWidth: 70,
        fontSize: 64,
        font: "blackletter",
        align: "center",
      },
      {
        field: "issuedAt",
        x: 50,
        y: 78,
        maxWidth: 50,
        fontSize: 22,
        font: "sans",
        align: "center",
        uppercase: true,
      },
      {
        field: "certificateNumber",
        x: 12,
        y: 92,
        maxWidth: 40,
        fontSize: 16,
        font: "sans",
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
        font: "blackletter",
        align: "center",
      },
      {
        field: "gradeOrTitle",
        x: 50,
        y: 62,
        maxWidth: 60,
        fontSize: 56,
        font: "blackletter",
        align: "center",
      },
      {
        field: "certificateNumber",
        x: 18,
        y: 88,
        maxWidth: 35,
        fontSize: 18,
        font: "sans",
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
        font: "blackletter",
        align: "center",
      },
      {
        field: "gradeOrTitle",
        x: 50,
        y: 42,
        maxWidth: 60,
        fontSize: 48,
        font: "serif",
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
        font: "script",
        align: "center",
      },
      {
        field: "month",
        x: 48,
        y: 68,
        maxWidth: 18,
        fontSize: 16,
        font: "script",
        align: "center",
      },
      {
        field: "year",
        x: 62,
        y: 68,
        maxWidth: 10,
        fontSize: 16,
        font: "script",
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
        font: "blackletter",
        align: "center",
      },
      {
        field: "gradeOrTitle",
        x: 50,
        y: 62,
        maxWidth: 60,
        fontSize: 36,
        font: "serif",
        align: "center",
        weight: "bold",
      },
      {
        field: "issuedAt",
        x: 50,
        y: 78,
        maxWidth: 50,
        fontSize: 20,
        font: "sans",
        align: "center",
        uppercase: true,
      },
      {
        field: "certificateNumber",
        x: 12,
        y: 92,
        maxWidth: 40,
        fontSize: 14,
        font: "sans",
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

/** Admin overrides for drag-aligned overlays (position + typography). */
export type OverlayFieldOverride = {
  field: CertificateOverlayField;
  x: number;
  y: number;
  fontSize?: number;
  align?: "center" | "left" | "right";
  maxWidth?: number;
  font?: CertificateFieldStyle["font"];
  weight?: "normal" | "bold";
};

/** @deprecated alias — use OverlayFieldOverride */
export type OverlayPositionOverride = OverlayFieldOverride;

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
      if (
        rec.font === "blackletter" ||
        rec.font === "serif" ||
        rec.font === "sans" ||
        rec.font === "script"
      ) {
        override.font = rec.font;
      }
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
    if (
      item.font === "blackletter" ||
      item.font === "serif" ||
      item.font === "sans" ||
      item.font === "script"
    ) {
      entry.font = item.font;
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

/** Merge saved overrides onto a base layout. */
export function applyOverlayPositionOverrides(
  layout: CertificateLayout,
  overrides: OverlayFieldOverride[] | null | undefined,
): CertificateLayout {
  if (!overrides?.length) return layout;
  const byField = new Map(overrides.map((o) => [o.field, o]));
  return {
    ...layout,
    fields: layout.fields.map((f) => {
      const o = byField.get(f.field);
      return o ? mergeFieldWithOverride(f, o) : f;
    }),
  };
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
    const byField = new Map(saved.map((o) => [o.field, o]));
    return baseLayout.fields.map((f) => {
      const savedField = byField.get(f.field);
      return savedField
        ? mergeFieldWithOverride(f, savedField)
        : overridesFromLayoutFields([f])[0]!;
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
  return effective.map((item) =>
    item.field === field ? { ...item, ...patch, field } : item,
  );
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
    case "certificateNumber":
      return values.certificateNumber
        ? `CERTIFICATE NO. ${values.certificateNumber.replace(/^DPM-\d+-/, "").replace(/^0+/, "") || values.certificateNumber}`
        : "CERTIFICATE NO.";
    case "memberNumber": {
      const num =
        values.memberNumber ??
        values.certificateNumber.replace(/\D/g, "").slice(-5);
      return num ? `# ${num}` : "#";
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
