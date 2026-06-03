import type { BookingListItemDto } from "@/types/booking";
import type { PilotProfileStatus } from "@/types/pilot";
import type { ReviewStatus } from "@/types/review";
import type { UserRole } from "@/types/roles";

export type AdminOverviewStats = {
  pendingJobs: number;
  pendingPilots: number;
  pendingVerifications: number;
  openJobs: number;
  activeBookings: number;
  totalUsers: number;
  totalPilots: number;
  totalClients: number;
  completedBookings: number;
  totalCommission: number;
  waitlistSubscribers: number;
  activeDisputes: number;
};

export type AdminUserDto = {
  id: string;
  email: string;
  role: UserRole;
  status: string;
  createdAt: string;
  pilotProfileId: string | null;
  clientProfileId: string | null;
};

export type AdminPilotDto = {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  status: PilotProfileStatus;
  isPublic: boolean;
  locationCity: string | null;
  locationRegion: string | null;
  licenseNumber: string;
  onboardingCompletedAt: string | null;
  createdAt: string;
};

export type AdminClientDto = {
  id: string;
  userId: string;
  email: string;
  contactName: string;
  companyName: string | null;
  status: string;
  jobCount: number;
  onboardingCompletedAt: string | null;
  createdAt: string;
};

export type AdminApplicationDto = {
  id: string;
  jobId: string;
  jobTitle: string;
  pilotProfileId: string;
  pilotName: string;
  proposedAmount: number;
  currency: string;
  status: string;
  submittedAt: string;
};

export type AdminPaymentDto = {
  id: string;
  bookingId: string;
  jobTitle: string;
  amountGross: number;
  amountNet: number;
  currency: string;
  status: string;
  createdAt: string;
  commission: {
    id: string;
    rate: number;
    amount: number;
    status: string;
  } | null;
};

export type AdminReviewDto = {
  id: string;
  bookingId: string;
  jobTitle: string;
  authorEmail: string;
  targetLabel: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  createdAt: string;
};

export type AdminSubscriptionRowDto = {
  id: string;
  pilotName: string;
  pilotEmail: string;
  planName: string;
  status: string;
  currentPeriodEnd: string;
};

export type AdminPlanDto = {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  currency: string;
  isActive: boolean;
  subscriberCount: number;
};

export type { BookingListItemDto };
