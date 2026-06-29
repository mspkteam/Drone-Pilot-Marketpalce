export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "disputed",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type BookingDto = {
  id: string;
  jobId: string;
  jobApplicationId: string;
  pilotProfileId: string;
  clientProfileId: string;
  agreedAmount: number;
  currency: string;
  status: BookingStatus;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BookingListItemDto = BookingDto & {
  job: {
    id: string;
    title: string;
    locationLabel: string;
    status: string;
  };
  pilot: {
    id: string;
    displayName: string;
  };
  client: {
    id: string;
    contactName: string;
    companyName: string | null;
  };
  conversationId: string | null;
};

export type ClientJobApplicationDto = {
  id: string;
  jobId: string;
  pilotProfileId: string;
  proposedAmount: number;
  currency: string;
  message: string | null;
  estimatedDeliveryDate: string | null;
  status: string;
  submittedAt: string;
  pilot: {
    id: string;
    displayName: string;
    locationCity: string | null;
    locationRegion: string | null;
    averageRating?: number | null;
    reviewCount?: number;
    completedBookings?: number;
    verified?: boolean;
  };
  shortlistedAt?: string | null;
};
