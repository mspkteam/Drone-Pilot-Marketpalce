import type { AdminPilotCertificateDto, CertificateTemplateDto } from "@/types/certificate";

export type AdminCertificateTemplateCardDto = CertificateTemplateDto & {
  triggerLabel: string;
  displayDescription: string;
  previewTitleLines: string[];
  previewMission: string;
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
