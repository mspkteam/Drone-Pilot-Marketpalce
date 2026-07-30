import type { AdminPilotCertificateDto, CertificateTemplateDto } from "@/types/certificate";

export type AdminCertificateTemplateCardDto = CertificateTemplateDto & {
  triggerLabel: string;
  displayDescription: string;
  previewTitleLines: string[];
  previewMission: string;
  previewGrade?: string | null;
  requiresGrade?: boolean;
  /** Fields admins must fill on manual issue (derived from certificate layout). */
  manualIssueFields?: Array<"memberNumber" | "issuedAt" | "gradeOrTitle">;
  isMock?: boolean;
};

export type AdminCertificateStatsDto = {
  activeTemplates: number;
  activeTemplatesSubtext: string;
  totalIssued: number;
  totalIssuedSubtext: string;
  issued30d: number;
  issued30dSubtext: string;
  recipients: number;
  recipientsSubtext: string;
};

export type AdminCertificateEngineDataDto = {
  templates: AdminCertificateTemplateCardDto[];
  stats: AdminCertificateStatsDto;
  certificates: AdminPilotCertificateDto[];
  pilots: Array<{
    id: string;
    displayName: string;
    email: string;
    licenseNumber: string;
    memberNumber: string | null;
  }>;
  usingMockTemplates: boolean;
};

export type CertificateTemplateFormInput = {
  name: string;
  description: string;
  title: string;
  bodyTemplate: string;
  isActive: boolean;
  backgroundImageUrl?: string | null;
  layoutKey?: string | null;
  overlayPositions?: Array<{
    field: string;
    x: number;
    y: number;
    fontSize?: number;
    align?: string;
    maxWidth?: number;
    font?: string;
    weight?: string;
  }> | null;
  autoRule?: string;
  ruleParam?: string | null;
  threshold?: number | null;
  requiresGrade?: boolean;
};
