/** Named client fonts for certificate overlays (preview + PDF). */

export const CERTIFICATE_FONT_KEYS = [
  "engravers",
  "harrowgate",
  "colchester",
  "arial",
] as const;

export type CertificateFontKey = (typeof CERTIFICATE_FONT_KEYS)[number];

export const CERTIFICATE_FONT_LABELS: Record<CertificateFontKey, string> = {
  engravers: "Engravers MT",
  harrowgate: "Harrowgate",
  colchester: "Colchester",
  arial: "Arial",
};

/** Public URL paths for @font-face / CSS. */
export const CERTIFICATE_FONT_PUBLIC: Record<
  Exclude<CertificateFontKey, "arial">,
  string
> = {
  engravers: "/fonts/engravers-mt.ttf",
  harrowgate: "/fonts/harrowgate.ttf",
  colchester: "/fonts/colchester.ttf",
};

/** CSS font-family stacks for admin canvas preview. */
export const CERTIFICATE_FONT_CSS: Record<CertificateFontKey, string> = {
  engravers: '"Engravers MT", "EngraversMT", "Times New Roman", serif',
  harrowgate: '"Harrowgate", "Old English Text", serif',
  colchester: '"Colchester", "Old English Text", serif',
  arial: "Arial, Helvetica, sans-serif",
};

export const CERTIFICATE_FONT_FILE_NAMES: Record<
  Exclude<CertificateFontKey, "arial">,
  string
> = {
  engravers: "engravers-mt.ttf",
  harrowgate: "harrowgate.ttf",
  colchester: "colchester.ttf",
};

export function isCertificateFontKey(value: unknown): value is CertificateFontKey {
  return (
    typeof value === "string" &&
    (CERTIFICATE_FONT_KEYS as readonly string[]).includes(value)
  );
}

/** Map legacy role names from earlier builds onto named fonts. */
export function migrateLegacyFontRole(value: unknown): CertificateFontKey | null {
  if (isCertificateFontKey(value)) return value;
  if (value === "blackletter") return "colchester";
  if (value === "serif") return "engravers";
  if (value === "script") return "harrowgate";
  if (value === "sans") return "arial";
  return null;
}
