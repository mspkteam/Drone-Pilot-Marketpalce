import type { CertificateTemplateDto } from "@/types/certificate";
import type { AdminCertificateTemplateCardDto } from "@/types/admin-certificates";

export const DEFAULT_CERTIFICATE_BODY = `This certifies that {{pilotName}} (License {{licenseNumber}}) has met the requirements for {{templateName}} on Remote Air Service.

Certificate number: {{certificateNumber}}
Issue date: {{issueDate}}`;

type DisplayMeta = {
  triggerLabel: string;
  displayDescription: string;
  previewTitleLines: string[];
  previewMission: string;
};

const DISPLAY_META_BY_KEY: Record<string, DisplayMeta> = {
  "mission-completion": {
    triggerLabel: "On mission settled",
    displayDescription:
      "Auto-issues to pilot dashboard and emails a PDF copy. Includes platform signature and verification QR.",
    previewTitleLines: ["CERTIFICATE", "OF MISSION"],
    previewMission: "Coastal Infrastructure Survey",
  },
  "100-flight-hours": {
    triggerLabel: "Hours milestone",
    displayDescription:
      "Issued upon hitting exactly 100 cumulative verified flight hours. High priority.",
    previewTitleLines: ["CERTIFICATE", "OF EXCELLENCE"],
    previewMission: "100 Verified Flight Hours",
  },
  "elite-pilot-status": {
    triggerLabel: "Tier upgrade to A-4+",
    displayDescription:
      "Reserved for Top 1% performers within specific military sectors.",
    previewTitleLines: ["ELITE PILOT", "CERTIFICATE"],
    previewMission: "A-4 Sr. Flight Officer Tier",
  },
  "safety-excellence": {
    triggerLabel: "12 months, zero incidents",
    displayDescription:
      "Annual safety award for maintaining perfect operational records.",
    previewTitleLines: ["SAFETY", "EXCELLENCE"],
    previewMission: "Perfect Operational Record — 12 Months",
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

export const MOCK_CERTIFICATE_TEMPLATES: AdminCertificateTemplateCardDto[] = [
  {
    id: "mock-mission-completion",
    name: "Mission Completion",
    slug: "mission-completion",
    description: null,
    title: "Certificate of Mission Completion",
    bodyTemplate: DEFAULT_CERTIFICATE_BODY,
    isActive: true,
    issuedCount: 2840,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    triggerLabel: "On mission settled",
    displayDescription:
      "Auto-issues to pilot dashboard and emails a PDF copy. Includes platform signature and verification QR.",
    previewTitleLines: ["CERTIFICATE", "OF MISSION"],
    previewMission: "Coastal Infrastructure Survey",
    isMock: true,
  },
  {
    id: "mock-100-flight-hours",
    name: "100 Flight Hours",
    slug: "100-flight-hours",
    description: null,
    title: "100 Flight Hours Milestone",
    bodyTemplate: DEFAULT_CERTIFICATE_BODY,
    isActive: true,
    issuedCount: 412,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    triggerLabel: "Hours milestone",
    displayDescription:
      "Issued upon hitting exactly 100 cumulative verified flight hours. High priority.",
    previewTitleLines: ["CERTIFICATE", "OF EXCELLENCE"],
    previewMission: "100 Verified Flight Hours",
    isMock: true,
  },
  {
    id: "mock-elite-pilot",
    name: "Elite Pilot Status",
    slug: "elite-pilot-status",
    description: null,
    title: "Elite Pilot Certificate",
    bodyTemplate: DEFAULT_CERTIFICATE_BODY,
    isActive: true,
    issuedCount: 92,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    triggerLabel: "Tier upgrade to A-4+",
    displayDescription:
      "Reserved for Top 1% performers within specific military sectors.",
    previewTitleLines: ["ELITE PILOT", "CERTIFICATE"],
    previewMission: "A-4 Sr. Flight Officer Tier",
    isMock: true,
  },
  {
    id: "mock-safety-excellence",
    name: "Safety Excellence",
    slug: "safety-excellence",
    description: null,
    title: "Safety Excellence Award",
    bodyTemplate: DEFAULT_CERTIFICATE_BODY,
    isActive: true,
    issuedCount: 188,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    triggerLabel: "12 months, zero incidents",
    displayDescription:
      "Annual safety award for maintaining perfect operational records.",
    previewTitleLines: ["SAFETY", "EXCELLENCE"],
    previewMission: "Perfect Operational Record — 12 Months",
    isMock: true,
  },
];
