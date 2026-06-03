export const DISPUTE_STATUSES = ["open", "under_review", "resolved"] as const;

export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

export const DISPUTE_ENTRY_TYPES = ["note", "evidence", "comment"] as const;

export type DisputeEntryType = (typeof DISPUTE_ENTRY_TYPES)[number];

export const DISPUTE_RESOLUTION_TYPES = [
  "full_payout",
  "partial_payout",
  "refund",
] as const;

export type DisputeResolutionType = (typeof DISPUTE_RESOLUTION_TYPES)[number];

export const DISPUTE_PARTY_ROLES = ["client", "pilot"] as const;

export type DisputePartyRole = (typeof DISPUTE_PARTY_ROLES)[number];

export type DisputeEntryDto = {
  id: string;
  disputeId: string;
  authorUserId: string;
  authorRole: string;
  authorLabel: string;
  entryType: DisputeEntryType;
  body: string;
  attachmentUrl: string | null;
  createdAt: string;
};

export type DisputeSummaryDto = {
  id: string;
  bookingId: string;
  status: DisputeStatus;
  reason: string;
  openedByRole: DisputePartyRole;
  openedByUserId: string;
  resolutionType: DisputeResolutionType | null;
  resolutionAmount: number | null;
  resolutionNotes: string | null;
  reviewedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  entryCount: number;
};

export type DisputeListItemDto = DisputeSummaryDto & {
  booking: {
    id: string;
    agreedAmount: number;
    currency: string;
    status: string;
    job: { id: string; title: string };
    pilot: { id: string; displayName: string };
    client: { id: string; contactName: string; companyName: string | null };
  };
};

export type DisputeDetailDto = DisputeListItemDto & {
  entries: DisputeEntryDto[];
  canAddEntry: boolean;
  canStartReview: boolean;
  canResolve: boolean;
};
