import type { ProposalDetails } from "@/lib/applications/proposal-metadata";

export const APPLICATION_STATUSES = [
  "draft",
  "submitted",
  "withdrawn",
  "accepted",
  "rejected",
  "expired",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type JobApplicationDto = {
  id: string;
  jobId: string;
  pilotProfileId: string;
  proposedAmount: number;
  currency: string;
  message: string | null;
  estimatedDeliveryDate: string | null;
  proposalDetails: ProposalDetails | null;
  draftForm?: Record<string, unknown> | null;
  shortlistedAt: string | null;
  clientViewedAt: string | null;
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
};

export type PilotOpenJobDto = {
  id: string;
  title: string;
  description: string;
  category: string;
  locationLabel: string;
  locationCity: string | null;
  locationRegion: string | null;
  locationCountry: string | null;
  scheduledDate: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  requirements: string | null;
  status: string;
  createdAt: string;
  approvedAt: string | null;
  visibleAt: string;
  canApply: boolean;
  applyBlockedReason: string | null;
  hasApplied: boolean;
  applicationId: string | null;
  clientDisplayName: string;
  clientAvatarUrl: string | null;
  postProject: {
    deliverables: string[];
    quoteTypeLabel: string;
    priorityLabel: string;
    completionDate: string | null;
  } | null;
};

export type PilotLockedJobDto = {
  id: string;
  title: string;
  locationLabel: string;
  category: string;
  status: string;
  visibleAt: string;
  jobVisibilityDelayHours: number;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  requirements: string | null;
};

export type PilotJobsListResponse = {
  jobs: PilotOpenJobDto[];
  lockedJobs: PilotLockedJobDto[];
  membership: {
    tierName: string;
    tierCode: string;
    jobVisibilityDelayHours: number;
    canApply: boolean;
    instructorEligible: boolean;
  } | null;
  applyBlockedMessage: string | null;
};

export type PilotApplicationListItemDto = JobApplicationDto & {
  job: {
    id: string;
    title: string;
    locationLabel: string;
    status: string;
    clientDisplayName: string;
  };
};

export type PilotProposalDetailDto = JobApplicationDto & {
  job: {
    id: string;
    title: string;
    description: string;
    category: string;
    locationLabel: string;
    scheduledDate: string | null;
    budgetMin: number | null;
    budgetMax: number | null;
    currency: string;
    requirements: string | null;
    status: string;
    clientDisplayName: string;
  };
};

export type PilotJobDetailDto = {
  job: PilotOpenJobDto;
  application: JobApplicationDto | null;
  canApply: boolean;
  applyBlockedMessage: string | null;
  membership: {
    tierName: string;
    jobVisibilityDelayHours: number;
  } | null;
};
