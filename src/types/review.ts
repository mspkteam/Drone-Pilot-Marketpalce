export const REVIEW_STATUSES = ["published", "hidden", "flagged"] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export type ReviewDto = {
  id: string;
  bookingId: string;
  authorUserId: string;
  targetPilotProfileId: string | null;
  targetClientProfileId: string | null;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
};

export type ReviewListItemDto = ReviewDto & {
  booking: {
    id: string;
    job: { id: string; title: string };
  };
  authorLabel: string;
  targetLabel: string;
  direction: "given" | "received";
};

export type BookingReviewsDto = {
  reviews: ReviewDto[];
  myReview: ReviewDto | null;
  canReview: boolean;
  targetLabel: string;
};
