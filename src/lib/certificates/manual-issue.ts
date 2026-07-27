import {
  getCertificateLayout,
  OVERLAY_FIELD_LABELS,
  parseOverlayPositionsJson,
  type CertificateOverlayField,
} from "@/lib/certificates/layouts";

/** Admin-entered values on manual issue (auto fields like pilot name are excluded). */
export type ManualIssueFieldKey = "memberNumber" | "issuedAt" | "gradeOrTitle";

const AUTO_OVERLAY_FIELDS = new Set<CertificateOverlayField>([
  "pilotName",
  "certificateNumber",
]);

function collectOverlayFields(
  layoutKey: string | null | undefined,
  overlayPositions?: Array<{ field: string }> | null,
): Set<CertificateOverlayField> {
  const fields = new Set<CertificateOverlayField>();
  const layout = getCertificateLayout(layoutKey);
  for (const style of layout?.fields ?? []) {
    fields.add(style.field);
  }
  for (const override of overlayPositions ?? []) {
    if (
      typeof override.field === "string" &&
      (AUTO_OVERLAY_FIELDS.has(override.field as CertificateOverlayField) ||
        override.field === "gradeOrTitle" ||
        override.field === "memberNumber" ||
        override.field === "issuedAt" ||
        override.field === "awardDateShort" ||
        override.field === "day" ||
        override.field === "month" ||
        override.field === "year")
    ) {
      fields.add(override.field as CertificateOverlayField);
    }
  }
  return fields;
}

/** Resolve which manual issue inputs a template needs (derived from layout overlays). */
export function getManualIssueFields(
  layoutKey: string | null | undefined,
  overlayPositions?: Array<{ field: string }> | null,
): ManualIssueFieldKey[] {
  const fields = collectOverlayFields(layoutKey, overlayPositions);
  const manual: ManualIssueFieldKey[] = [];

  if (fields.has("gradeOrTitle")) {
    manual.push("gradeOrTitle");
  }
  if (fields.has("memberNumber")) {
    manual.push("memberNumber");
  }
  if (
    fields.has("issuedAt") ||
    fields.has("awardDateShort") ||
    fields.has("day") ||
    fields.has("month") ||
    fields.has("year")
  ) {
    manual.push("issuedAt");
  }

  return manual;
}

export function getManualIssueFieldsFromTemplate(template: {
  layoutKey?: string | null;
  slug?: string;
  overlayPositions?: Array<{ field: string }> | null;
  overlayPositionsJson?: string | null;
}): ManualIssueFieldKey[] {
  const layoutKey = template.layoutKey ?? template.slug ?? null;
  const positions =
    template.overlayPositions ??
    parseOverlayPositionsJson(template.overlayPositionsJson);
  return getManualIssueFields(layoutKey, positions);
}

export function manualIssueFieldLabel(key: ManualIssueFieldKey): string {
  switch (key) {
    case "memberNumber":
      return OVERLAY_FIELD_LABELS.memberNumber;
    case "issuedAt":
      return "Award / issue date";
    case "gradeOrTitle":
      return OVERLAY_FIELD_LABELS.gradeOrTitle;
    default:
      return key;
  }
}

export function parseManualIssueDate(value: string | null | undefined): Date | null {
  if (!value?.trim()) return null;
  const isoDate = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDate) {
    const year = Number(isoDate[1]);
    const month = Number(isoDate[2]) - 1;
    const day = Number(isoDate[3]);
    return new Date(year, month, day, 12, 0, 0, 0);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
