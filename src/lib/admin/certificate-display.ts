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
  previewGrade?: string;
  requiresGrade?: boolean;
};

const DISPLAY_META_BY_KEY: Record<string, DisplayMeta> = {
  "certificate-of-promotion": {
    triggerLabel: "On grade promotion (A-1–A-5)",
    displayDescription:
      "Issued when a member advances to a new Remote Air Service grade (A-1 through A-5). Fillable RAS template.",
    previewTitleLines: ["CERTIFICATE", "OF PROMOTION"],
    previewMission: "First Officer",
    previewGrade: "First Officer",
    requiresGrade: true,
  },
  "certificate-of-promotion-example": {
    triggerLabel: "Reference — filled example",
    displayDescription:
      "Client-provided example showing a completed Certificate of Promotion (A-1–A-5). Not issued to pilots.",
    previewTitleLines: ["CERTIFICATE", "OF PROMOTION"],
    previewMission: "First Officer",
    previewGrade: "First Officer",
  },
  "captain-promotion": {
    triggerLabel: "Promotion to Captain (A-6)",
    displayDescription:
      "Official Captain promotion certificate from the Commander and Board of Directors. Fillable RAS template.",
    previewTitleLines: ["CERTIFICATE", "OF PROMOTION"],
    previewMission: "CAPTAIN",
    previewGrade: "CAPTAIN",
    requiresGrade: true,
  },
  "captain-promotion-example": {
    triggerLabel: "Reference — filled example",
    displayDescription:
      "Client-provided example of a completed Captain promotion certificate. Not issued to pilots.",
    previewTitleLines: ["CERTIFICATE", "OF PROMOTION"],
    previewMission: "CAPTAIN",
    previewGrade: "CAPTAIN",
  },
  "recreational-pilot-wings": {
    triggerLabel: "Recreational recognition",
    displayDescription:
      "Recognizes Recreational Pilot: UAS and awards recreational pilot wings. Fillable RAS template.",
    previewTitleLines: ["RECREATIONAL PILOT", "UAS"],
    previewMission: "Recreational Pilot: Unmanned Aircraft Systems",
  },
  "recreational-pilot-wings-example": {
    triggerLabel: "Reference — filled example",
    displayDescription:
      "Client-provided example of completed Recreational Pilot Wings. Not issued to pilots.",
    previewTitleLines: ["RECREATIONAL PILOT", "UAS"],
    previewMission: "Recreational Pilot: Unmanned Aircraft Systems",
  },
  "aviator-wings": {
    triggerLabel: "Remote Pilot / Aviator Wings",
    displayDescription:
      "Awards Remote Pilot and Aviator Wings. Fillable RAS template.",
    previewTitleLines: ["REMOTE PILOT", "AVIATOR WINGS"],
    previewMission: "REMOTE PILOT / AVIATOR WINGS",
  },
  "senior-aviator-wings": {
    triggerLabel: "Hours / contracts milestone",
    displayDescription:
      "500 remote flight hours OR five RAS contracts with perfect rating. Fillable RAS template.",
    previewTitleLines: ["SENIOR REMOTE PILOT", "SENIOR AVIATOR WINGS"],
    previewMission: "SENIOR REMOTE PILOT / SENIOR AVIATOR WINGS",
  },
  "master-aviator-wings": {
    triggerLabel: "Hours / contracts milestone",
    displayDescription:
      "1,000 remote flight hours OR ten RAS contracts with perfect rating. Fillable RAS template.",
    previewTitleLines: ["MASTER REMOTE PILOT", "MASTER AVIATOR WINGS"],
    previewMission: "MASTER REMOTE PILOT / MASTER AVIATOR WINGS",
  },
  "master-aviator-wings-example": {
    triggerLabel: "Reference — filled example",
    displayDescription:
      "Client-provided example of completed Master Aviator Wings. Not issued to pilots.",
    previewTitleLines: ["MASTER REMOTE PILOT", "MASTER AVIATOR WINGS"],
    previewMission: "MASTER REMOTE PILOT / MASTER AVIATOR WINGS",
  },
};

function layoutKeyForSlug(slug: string): string {
  return slug.replace(/-example$/, "").replace(/-fillable$/, "");
}

function metaForTemplate(template: CertificateTemplateDto): DisplayMeta {
  const bySlug = DISPLAY_META_BY_KEY[template.slug];
  if (bySlug) return bySlug;

  const layoutSlug = layoutKeyForSlug(template.slug);
  const byLayout = DISPLAY_META_BY_KEY[layoutSlug];
  if (byLayout) return byLayout;

  const byLayoutKey =
    template.layoutKey && DISPLAY_META_BY_KEY[template.layoutKey]
      ? DISPLAY_META_BY_KEY[template.layoutKey]
      : null;
  if (byLayoutKey) return byLayoutKey;

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
    previewGrade: meta.previewGrade ?? null,
    requiresGrade: Boolean(meta.requiresGrade),
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
 * All ten client-provided RAS certificate PNGs (6 fillable + 4 reference examples).
 */
export const CANONICAL_CERTIFICATE_TEMPLATES: Array<{
  name: string;
  slug: string;
  title: string;
  bodyTemplate: string;
  description: string;
  backgroundImageUrl: string;
  layoutKey: string;
  isActive: boolean;
  issuedCount: number;
}> = [
  {
    name: "Certificate of Promotion (Fillable)",
    slug: "certificate-of-promotion",
    title: "Certificate of Promotion",
    bodyTemplate: PROMOTION_BODY,
    description:
      "Fillable template — issued when a member advances to grade A-1 through A-5.",
    backgroundImageUrl: "/certificates/certificate-of-promotion-fillable.png",
    layoutKey: "certificate-of-promotion",
    isActive: true,
    issuedCount: 0,
  },
  {
    name: "Certificate of Promotion (Example)",
    slug: "certificate-of-promotion-example",
    title: "Certificate of Promotion — Example",
    bodyTemplate: PROMOTION_BODY,
    description:
      "Reference example with sample data filled in. For admin preview only.",
    backgroundImageUrl: "/certificates/certificate-of-promotion-example.png",
    layoutKey: "certificate-of-promotion",
    isActive: false,
    issuedCount: 0,
  },
  {
    name: "Captain Promotion (Fillable)",
    slug: "captain-promotion",
    title: "Captain Promotion Certificate",
    bodyTemplate: CAPTAIN_BODY,
    description:
      "Fillable Captain (A-6) promotion certificate from Commander and Board.",
    backgroundImageUrl: "/certificates/captain-promotion-fillable.png",
    layoutKey: "captain-promotion",
    isActive: true,
    issuedCount: 0,
  },
  {
    name: "Captain Promotion (Example)",
    slug: "captain-promotion-example",
    title: "Captain Promotion — Example",
    bodyTemplate: CAPTAIN_BODY,
    description:
      "Reference example with sample Captain promotion data. Admin preview only.",
    backgroundImageUrl: "/certificates/captain-promotion-example.png",
    layoutKey: "captain-promotion",
    isActive: false,
    issuedCount: 0,
  },
  {
    name: "Recreational Pilot Wings (Fillable)",
    slug: "recreational-pilot-wings",
    title: "Recreational Pilot: Unmanned Aircraft Systems",
    bodyTemplate: WINGS_BODY,
    description: "Fillable Recreational Pilot UAS wings certificate.",
    backgroundImageUrl: "/certificates/recreational-pilot-wings-fillable.png",
    layoutKey: "recreational-pilot-wings",
    isActive: true,
    issuedCount: 0,
  },
  {
    name: "Recreational Pilot Wings (Example)",
    slug: "recreational-pilot-wings-example",
    title: "Recreational Pilot Wings — Example",
    bodyTemplate: WINGS_BODY,
    description:
      "Reference example of completed Recreational Pilot Wings. Admin preview only.",
    backgroundImageUrl: "/certificates/recreational-pilot-wings-example.png",
    layoutKey: "recreational-pilot-wings",
    isActive: false,
    issuedCount: 0,
  },
  {
    name: "Aviator Wings (Fillable)",
    slug: "aviator-wings",
    title: "Remote Pilot — Aviator Wings",
    bodyTemplate: WINGS_BODY,
    description: "Fillable Remote Pilot Aviator Wings award certificate.",
    backgroundImageUrl: "/certificates/aviator-wings-fillable.png",
    layoutKey: "aviator-wings",
    isActive: true,
    issuedCount: 0,
  },
  {
    name: "Senior Aviator Wings (Fillable)",
    slug: "senior-aviator-wings",
    title: "Senior Remote Pilot — Senior Aviator Wings",
    bodyTemplate: WINGS_BODY,
    description:
      "Fillable Senior Aviator Wings — 500 hours or five perfect contracts.",
    backgroundImageUrl: "/certificates/senior-aviator-wings-fillable.png",
    layoutKey: "senior-aviator-wings",
    isActive: true,
    issuedCount: 0,
  },
  {
    name: "Master Aviator Wings (Fillable)",
    slug: "master-aviator-wings",
    title: "Master Remote Pilot — Master Aviator Wings",
    bodyTemplate: WINGS_BODY,
    description:
      "Fillable Master Aviator Wings — 1,000 hours or ten perfect contracts.",
    backgroundImageUrl: "/certificates/master-aviator-wings-fillable.png",
    layoutKey: "master-aviator-wings",
    isActive: true,
    issuedCount: 0,
  },
  {
    name: "Master Aviator Wings (Example)",
    slug: "master-aviator-wings-example",
    title: "Master Aviator Wings — Example",
    bodyTemplate: WINGS_BODY,
    description:
      "Reference example of completed Master Aviator Wings. Admin preview only.",
    backgroundImageUrl: "/certificates/master-aviator-wings-example.png",
    layoutKey: "master-aviator-wings",
    isActive: false,
    issuedCount: 0,
  },
];

/** Preview-only sample cards for canonical templates missing from the database. */
export const MOCK_CERTIFICATE_TEMPLATES: AdminCertificateTemplateCardDto[] =
  CANONICAL_CERTIFICATE_TEMPLATES.map((tpl) => {
    const meta =
      DISPLAY_META_BY_KEY[tpl.slug] ??
      DISPLAY_META_BY_KEY[tpl.layoutKey]!;
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
      isMock: true,
    };
  });
