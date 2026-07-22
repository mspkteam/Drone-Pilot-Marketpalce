export type CertificateTemplateDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  title: string;
  bodyTemplate: string;
  backgroundImageUrl: string | null;
  layoutKey: string | null;
  /** Drag-aligned field positions (percent), null = use layout defaults. */
  overlayPositions: Array<{ field: string; x: number; y: number }> | null;
  isActive: boolean;
  issuedCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PilotCertificateDto = {
  id: string;
  certificateNumber: string;
  pilotProfileId: string;
  templateId: string;
  templateName: string;
  pilotDisplayName: string;
  licenseNumber: string | null;
  awardGrade: string | null;
  issuedAt: string;
  issuedByUserId: string;
  notes: string | null;
  createdAt: string;
};

export type AdminPilotCertificateDto = PilotCertificateDto & {
  pilotEmail: string;
};
