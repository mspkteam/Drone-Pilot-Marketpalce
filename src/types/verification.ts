export const VERIFICATION_TYPES = [
  "license",
  "insurance",
  "identity",
  "other",
] as const;

export type VerificationType = (typeof VERIFICATION_TYPES)[number];

export const VERIFICATION_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "expired",
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export type VerificationDto = {
  id: string;
  pilotProfileId: string;
  type: VerificationType;
  documentUrl: string | null;
  documentFileName: string | null;
  documentMimeType: string | null;
  originalFileName: string | null;
  hasUploadedDocument: boolean;
  notes: string | null;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
  rejectionReason: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminVerificationDto = VerificationDto & {
  pilot: {
    id: string;
    displayName: string;
    email: string;
    licenseNumber: string;
    licenseCountry: string | null;
    locationCity: string | null;
    locationRegion: string | null;
    locationCountry: string | null;
  };
};
