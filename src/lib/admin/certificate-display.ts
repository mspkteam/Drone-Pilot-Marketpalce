import type { CertificateTemplateDto } from "@/types/certificate";
import type { AdminCertificateTemplateCardDto } from "@/types/admin-certificates";

export const DEFAULT_CERTIFICATE_BODY = `This certifies that {{pilotName}} (License {{licenseNumber}}) has met the requirements for {{templateName}} on Remote Air Service.

Certificate number: {{certificateNumber}}
Issue date: {{issueDate}}`;

/** Split a certificate title into (at most) two balanced display lines. */
export function splitCertificateTitleLines(title: string): string[] {
  const upper = title.trim().toUpperCase();
  if (!upper) return ["CERTIFICATE"];

  const byDash = upper.split(/\s*[—–-]\s*/).filter(Boolean);
  if (byDash.length === 2) return byDash;

  const ofMatch = upper.match(/^(.*?\S)\s+(OF\s+\S.*)$/);
  if (ofMatch) return [ofMatch[1], ofMatch[2]];

  const words = upper.split(/\s+/);
  if (words.length <= 2) return [upper];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

type DisplayMeta = {
  triggerLabel: string;
  displayDescription: string;
  previewTitleLines: string[];
  previewMission: string;
};

const DISPLAY_META_BY_KEY: Record<string, DisplayMeta> = {
  "certificate-of-promotion": {
    triggerLabel: "On grade promotion",
    displayDescription:
      "Issued when a member advances to a new Remote Air Service grade. Auto-issues to the pilot dashboard and emails a PDF copy with platform signature and verification QR.",
    previewTitleLines: ["CERTIFICATE", "OF PROMOTION"],
    previewMission: "[New grade: First Officer / Captain / etc.]",
  },
  "aviator-wings-senior": {
    triggerLabel: "Hours milestone",
    displayDescription:
      "Awarded after 500 remote flight hours OR qualifying pilot certificate OR five Remote Air Service contracts with a perfect rating.",
    previewTitleLines: ["AVIATOR WINGS", "SENIOR"],
    previewMission: "500 Remote Flight Hours",
  },
  "aviator-wings-master": {
    triggerLabel: "Tier upgrade to A-4+",
    displayDescription:
      "Awarded after 1,000 hours OR qualifying FAA Private Pilot Certificate, AND five Remote Air Service contracts with a perfect rating.",
    previewTitleLines: ["AVIATOR WINGS", "MASTER"],
    previewMission: "1,000 Verified Flight Hours",
  },
  "aviator-wings-basic-gold": {
    triggerLabel: "12 months, zero incidents",
    displayDescription:
      "Awarded to FAA Part 107 Remote Pilot Certificate holders.",
    previewTitleLines: ["AVIATOR WINGS", "BASIC GOLD"],
    previewMission: "FAA Part 107 Remote Pilot Certificate",
  },
  "platform-verified-pilot": {
    triggerLabel: "Admin issue / onboarding",
    displayDescription:
      "Platform recognition for verified pilots meeting marketplace standards.",
    previewTitleLines: ["CERTIFICATE", "OF RECOGNITION"],
    previewMission: "Platform Verified Pilot",
  },
};

function metaForTemplate(template: CertificateTemplateDto): DisplayMeta {
  const bySlug = DISPLAY_META_BY_KEY[template.slug];
  if (bySlug) return bySlug;

  const slugGuess = Object.keys(DISPLAY_META_BY_KEY).find((key) =>
    template.name.toLowerCase().includes(key.replace(/-/g, " ")),
  );
  if (slugGuess) return DISPLAY_META_BY_KEY[slugGuess]!;

  const titleParts = template.title.split(/\s+/).slice(0, 2);
  return {
    triggerLabel: "Manual / admin issue",
    displayDescription:
      template.description ??
      "Issues a signed PDF to the pilot dashboard when manually triggered or automated rules are connected.",
    previewTitleLines:
      titleParts.length >= 2
        ? [titleParts[0]!.toUpperCase(), titleParts.slice(1).join(" ").toUpperCase()]
        : [template.title.toUpperCase()],
    previewMission: template.name,
  };
}

export function enrichCertificateTemplate(
  template: CertificateTemplateDto,
): AdminCertificateTemplateCardDto {
  const meta = metaForTemplate(template);
  return {
    ...template,
    triggerLabel: meta.triggerLabel,
    displayDescription: template.description ?? meta.displayDescription,
    previewTitleLines: meta.previewTitleLines,
    previewMission: meta.previewMission,
    isMock: false,
  };
}

const PROMOTION_BODY = `This certifies that {{pilotName}} has successfully completed the requirements to advance within Remote Air Service.

Awarded for: {{templateName}}
Certificate number: {{certificateNumber}}
Issue date: {{issueDate}}`;

const WINGS_BODY = `This certifies that {{pilotName}} (License {{licenseNumber}}) has earned {{templateName}} on Remote Air Service.

Certificate number: {{certificateNumber}}
Issue date: {{issueDate}}`;

/**
 * Canonical Remote Air Service certificate templates (Figma 808:37671).
 * Used as preview-only samples until the matching real template exists in the
 * database (see seed.ts), and to seed display metadata by slug.
 */
export const CANONICAL_CERTIFICATE_TEMPLATES: Array<{
  name: string;
  slug: string;
  title: string;
  bodyTemplate: string;
  description: string;
  issuedCount: number;
}> = [
  {
    name: "Certificate of Promotion",
    slug: "certificate-of-promotion",
    title: "Certificate of Promotion",
    bodyTemplate: PROMOTION_BODY,
    description:
      "Issued when a member advances to a new Remote Air Service grade.",
    issuedCount: 0,
  },
  {
    name: "Aviator Wings, Senior",
    slug: "aviator-wings-senior",
    title: "Aviator Wings — Senior",
    bodyTemplate: WINGS_BODY,
    description:
      "Awarded after 500 remote flight hours OR qualifying pilot certificate OR five Remote Air Service contracts with a perfect rating.",
    issuedCount: 412,
  },
  {
    name: "Aviator Wings, Master",
    slug: "aviator-wings-master",
    title: "Aviator Wings — Master",
    bodyTemplate: WINGS_BODY,
    description:
      "Awarded after 1,000 hours OR qualifying FAA Private Pilot Certificate, AND five Remote Air Service contracts with a perfect rating.",
    issuedCount: 92,
  },
  {
    name: "Aviator Wings, Basic Gold",
    slug: "aviator-wings-basic-gold",
    title: "Aviator Wings — Basic Gold",
    bodyTemplate: WINGS_BODY,
    description: "Awarded to FAA Part 107 Remote Pilot Certificate holders.",
    issuedCount: 188,
  },
];

/** Preview-only sample cards for canonical templates missing from the database. */
export const MOCK_CERTIFICATE_TEMPLATES: AdminCertificateTemplateCardDto[] =
  CANONICAL_CERTIFICATE_TEMPLATES.map((tpl) => {
    const meta = DISPLAY_META_BY_KEY[tpl.slug]!;
    const now = new Date().toISOString();
    return {
      id: `sample-${tpl.slug}`,
      name: tpl.name,
      slug: tpl.slug,
      description: tpl.description,
      title: tpl.title,
      bodyTemplate: tpl.bodyTemplate,
      isActive: true,
      issuedCount: tpl.issuedCount,
      createdAt: now,
      updatedAt: now,
      triggerLabel: meta.triggerLabel,
      displayDescription: tpl.description,
      previewTitleLines: meta.previewTitleLines,
      previewMission: meta.previewMission,
      isMock: true,
    };
  });
