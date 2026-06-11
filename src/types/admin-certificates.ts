import type { AdminPilotCertificateDto, CertificateTemplateDto } from "@/types/certificate";

export type AdminCertificateTemplateCardDto = CertificateTemplateDto & {
  triggerLabel: string;
  displayDescription: string;
  previewTitleLines: string[];
  previewMission: string;
  isMock?: boolean;
};

export type AdminCertificateStatsDto = {
  templateCount: number;
  issued30d: number;
  issued30dSubtext: string;
  totalIssued: number;
  pdfRenderTimeLabel: string;
  pdfRenderTimeSubtext: string;
  usingMockStats: boolean;
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
  }>;
  usingMockTemplates: boolean;
};

export type CertificateTemplateFormInput = {
  name: string;
  description: string;
  title: string;
  bodyTemplate: string;
  isActive: boolean;
};
