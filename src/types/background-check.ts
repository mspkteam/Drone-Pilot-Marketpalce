export const BACKGROUND_CHECK_STATUSES = [
  "not_started",
  "paid",
  "in_review",
  "cleared",
  "not_cleared",
] as const;

export type BackgroundCheckStatus = (typeof BACKGROUND_CHECK_STATUSES)[number];

export const BACKGROUND_CHECK_STATUS_LABELS: Record<BackgroundCheckStatus, string> = {
  not_started: "Not started",
  paid: "Paid — awaiting review",
  in_review: "In review",
  cleared: "Cleared",
  not_cleared: "Not cleared",
};

export type PilotBackgroundCheckDto = {
  id: string | null;
  pilotProfileId: string;
  status: BackgroundCheckStatus;
  consentAcceptedAt: string | null;
  feeUsd: number;
  paidAt: string | null;
  deadlineStartedAt: string;
  deadlineAt: string;
  daysRemaining: number;
  marketplacePaused: boolean;
  canPay: boolean;
  payBlockReason: string | null;
  faaCertificateNumber: string | null;
  faaVerifiedAt: string | null;
  faaVerifiedByName: string | null;
  reviewedAt: string | null;
};

export type AdminBackgroundCheckRowDto = {
  id: string;
  pilotProfileId: string;
  pilotName: string;
  pilotEmail: string;
  licenseNumber: string;
  status: BackgroundCheckStatus;
  paidAt: string | null;
  deadlineAt: string;
  daysRemaining: number;
  marketplacePaused: boolean;
  adminNotes: string | null;
  faaCertificateNumber: string | null;
  faaVerifiedById: string | null;
  faaVerifiedAt: string | null;
};
