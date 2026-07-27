import type { CertificateTemplateDto } from "@/types/certificate";
import type { AdminCertificateTemplateCardDto } from "@/types/admin-certificates";
import type { CertificateAutoRule } from "@/lib/certificates/conditions";
import { getCertificateConditionLabel } from "@/lib/certificates/conditions";
import { getManualIssueFieldsFromTemplate } from "@/lib/certificates/manual-issue";

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
  previewGrade?: string;
  requiresGrade?: boolean;
};

const DISPLAY_META_BY_KEY: Record<string, DisplayMeta> = {
  "certificate-of-promotion": {
    triggerLabel: "On grade promotion (A-1–A-5)",
    displayDescription:
      "Issued when a member advances to a new Remote Air Service grade (A-1 through A-5).",
    previewTitleLines: ["CERTIFICATE", "OF PROMOTION"],
    previewMission: "First Officer",
    previewGrade: "First Officer",
    requiresGrade: true,
  },
  "captain-promotion": {
    triggerLabel: "Promotion to Captain (A-6)",
    displayDescription:
      "Official Captain promotion certificate from the Commander and Board of Directors.",
    previewTitleLines: ["CERTIFICATE", "OF PROMOTION"],
    previewMission: "CAPTAIN",
    previewGrade: "CAPTAIN",
    requiresGrade: true,
  },
  "recreational-pilot-wings": {
    triggerLabel: "Recreational / UAS wing",
    displayDescription:
      "Recognizes Recreational Pilot: UAS when the recreational wing is earned.",
    previewTitleLines: ["RECREATIONAL PILOT", "UAS"],
    previewMission: "Recreational Pilot: Unmanned Aircraft Systems",
  },
  "aviator-wings": {
    triggerLabel: "Aviator / Remote Pilot wing",
    displayDescription: "Awards Remote Pilot and Aviator Wings when the basic aviator wing is earned.",
    previewTitleLines: ["REMOTE PILOT", "AVIATOR WINGS"],
    previewMission: "REMOTE PILOT / AVIATOR WINGS",
  },
  "senior-aviator-wings": {
    triggerLabel: "500h or 5 perfect contracts",
    displayDescription:
      "Senior Aviator Wings — five perfect RAS contracts or senior wing earned.",
    previewTitleLines: ["SENIOR REMOTE PILOT", "SENIOR AVIATOR WINGS"],
    previewMission: "SENIOR REMOTE PILOT / SENIOR AVIATOR WINGS",
  },
  "master-aviator-wings": {
    triggerLabel: "1,000h or 10 perfect contracts",
    displayDescription:
      "Master Aviator Wings — ten perfect RAS contracts or master wing earned.",
    previewTitleLines: ["MASTER REMOTE PILOT", "MASTER AVIATOR WINGS"],
    previewMission: "MASTER REMOTE PILOT / MASTER AVIATOR WINGS",
  },
};

function metaForTemplate(template: CertificateTemplateDto): DisplayMeta {
  const bySlug = DISPLAY_META_BY_KEY[template.slug];
  if (bySlug) return bySlug;

  const byLayout =
    template.layoutKey && DISPLAY_META_BY_KEY[template.layoutKey]
      ? DISPLAY_META_BY_KEY[template.layoutKey]
      : null;
  if (byLayout) return byLayout;

  const titleParts = template.title.split(/\s+/).slice(0, 2);
  return {
    triggerLabel: getCertificateConditionLabel(template.autoRule),
    displayDescription:
      template.description ??
      "Issues a signed PDF to the pilot dashboard when manually triggered or automated rules fire.",
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
    triggerLabel:
      template.autoRule && template.autoRule !== "manual_only"
        ? getCertificateConditionLabel(template.autoRule)
        : meta.triggerLabel,
    displayDescription: template.description ?? meta.displayDescription,
    previewTitleLines: meta.previewTitleLines,
    previewMission: meta.previewMission,
    previewGrade: meta.previewGrade ?? null,
    requiresGrade: Boolean(meta.requiresGrade),
    manualIssueFields: getManualIssueFieldsFromTemplate(template),
    isMock: false,
  };
}

const PROMOTION_BODY = `This certifies that {{pilotName}} has been promoted to the organizational grade of {{gradeOrTitle}} within Remote Air Service.

Certificate number: {{certificateNumber}}
Issue date: {{issueDate}}`;

const CAPTAIN_BODY = `This certifies that {{pilotName}} has been appointed to the rank of {{gradeOrTitle}} within the organization of United States Remote Air Service.

Certificate number: {{certificateNumber}}
Issue date: {{issueDate}}`;

const WINGS_BODY = `This certifies that {{pilotName}} (License {{licenseNumber}}) has earned {{templateName}} on Remote Air Service.

Certificate number: {{certificateNumber}}
Issue date: {{issueDate}}`;

/**
 * Six client fillable RAS certificate templates (examples are reference-only on disk).
 */
export const CANONICAL_CERTIFICATE_TEMPLATES: Array<{
  name: string;
  slug: string;
  title: string;
  bodyTemplate: string;
  description: string;
  backgroundImageUrl: string;
  layoutKey: string;
  autoRule: CertificateAutoRule;
  threshold?: number | null;
  isActive: boolean;
  issuedCount: number;
}> = [
  {
    name: "Certificate of Promotion",
    slug: "certificate-of-promotion",
    title: "Certificate of Promotion",
    bodyTemplate: PROMOTION_BODY,
    description:
      "Fillable template — auto-issued when a member reaches grade A-1 through A-5.",
    backgroundImageUrl: "/certificates/certificate-of-promotion-fillable.png",
    layoutKey: "certificate-of-promotion",
    autoRule: "grade_promotion_a1_a5",
    isActive: true,
    issuedCount: 0,
  },
  {
    name: "Captain Promotion",
    slug: "captain-promotion",
    title: "Captain Promotion Certificate",
    bodyTemplate: CAPTAIN_BODY,
    description: "Fillable Captain (A-6) promotion certificate — auto-issued at A-6.",
    backgroundImageUrl: "/certificates/captain-promotion-fillable.png",
    layoutKey: "captain-promotion",
    autoRule: "grade_captain_a6",
    isActive: true,
    issuedCount: 0,
  },
  {
    name: "Recreational Pilot Wings",
    slug: "recreational-pilot-wings",
    title: "Recreational Pilot: Unmanned Aircraft Systems",
    bodyTemplate: WINGS_BODY,
    description: "Fillable Recreational Pilot UAS wings — auto when recreational wing is earned.",
    backgroundImageUrl: "/certificates/recreational-pilot-wings-fillable.png",
    layoutKey: "recreational-pilot-wings",
    autoRule: "wing_recreational",
    isActive: true,
    issuedCount: 0,
  },
  {
    name: "Aviator Wings",
    slug: "aviator-wings",
    title: "Remote Pilot — Aviator Wings",
    bodyTemplate: WINGS_BODY,
    description: "Fillable Remote Pilot Aviator Wings — auto when basic aviator wing is earned.",
    backgroundImageUrl: "/certificates/aviator-wings-fillable.png",
    layoutKey: "aviator-wings",
    autoRule: "wing_aviator",
    isActive: true,
    issuedCount: 0,
  },
  {
    name: "Senior Aviator Wings",
    slug: "senior-aviator-wings",
    title: "Senior Remote Pilot — Senior Aviator Wings",
    bodyTemplate: WINGS_BODY,
    description:
      "Fillable Senior Aviator Wings — five perfect contracts or senior wing earned.",
    backgroundImageUrl: "/certificates/senior-aviator-wings-fillable.png",
    layoutKey: "senior-aviator-wings",
    autoRule: "hours_or_perfect_contracts_senior",
    threshold: 500,
    isActive: true,
    issuedCount: 0,
  },
  {
    name: "Master Aviator Wings",
    slug: "master-aviator-wings",
    title: "Master Remote Pilot — Master Aviator Wings",
    bodyTemplate: WINGS_BODY,
    description:
      "Fillable Master Aviator Wings — ten perfect contracts or master wing earned.",
    backgroundImageUrl: "/certificates/master-aviator-wings-fillable.png",
    layoutKey: "master-aviator-wings",
    autoRule: "hours_or_perfect_contracts_master",
    threshold: 1000,
    isActive: true,
    issuedCount: 0,
  },
];

/** Slugs that were examples / obsolete — deactivate on ensure. */
export const OBSOLETE_CERTIFICATE_SLUGS = [
  "certificate-of-promotion-example",
  "captain-promotion-example",
  "recreational-pilot-wings-example",
  "master-aviator-wings-example",
] as const;

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
      backgroundImageUrl: tpl.backgroundImageUrl,
      layoutKey: tpl.layoutKey,
      overlayPositions: null,
      autoRule: tpl.autoRule,
      ruleParam: null,
      threshold: tpl.threshold ?? null,
      isActive: tpl.isActive,
      issuedCount: tpl.issuedCount,
      createdAt: now,
      updatedAt: now,
      triggerLabel: meta.triggerLabel,
      displayDescription: tpl.description,
      previewTitleLines: meta.previewTitleLines,
      previewMission: meta.previewMission,
      previewGrade: meta.previewGrade ?? null,
      requiresGrade: Boolean(meta.requiresGrade),
      manualIssueFields: getManualIssueFieldsFromTemplate({
        layoutKey: tpl.layoutKey,
        slug: tpl.slug,
      }),
      isMock: true,
    };
  });
