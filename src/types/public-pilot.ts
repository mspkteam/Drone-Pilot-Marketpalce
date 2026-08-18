import type { PilotServiceId } from "@/types/pilot";
import type { PilotPortfolioItem } from "@/lib/pilot/portfolio";
import type { SubscriptionStatus } from "@/types/subscription";
import type { VerificationType } from "@/types/verification";
import type { PublicPilotWingDto } from "@/types/wing";

export type PublicPilotCertificateDto = {
  id: string;
  certificateNumber: string;
  templateName: string;
  issuedAt: string;
};

export type PublicPilotMembershipDto = {
  tierCode: string;
  tierName: string;
  status: SubscriptionStatus;
  jobVisibilityDelayHours: number;
  canApply: boolean;
  canViewJobs: boolean;
  instructorEligible: boolean;
};

export type PublicPilotReviewDto = {
  id: string;
  rating: number;
  comment: string | null;
  authorLabel: string;
  createdAt: string;
};

export type PublicPilotListItemDto = {
  id: string;
  displayName: string;
  bio: string | null;
  locationCity: string | null;
  locationRegion: string | null;
  locationCountry: string | null;
  servicesOffered: PilotServiceId[];
  hourlyRateMin: number | null;
  hourlyRateMax: number | null;
  averageRating: number | null;
  reviewCount: number;
};

export type PublicPilotProfileDto = PublicPilotListItemDto & {
  serviceRadiusKm: number | null;
  callSign: string | null;
  avatarUrl: string | null;
  mainDrones: string[];
  payloads: string[];
  portfolio: PilotPortfolioItem[];
  verifiedTypes: VerificationType[];
  recentReviews: PublicPilotReviewDto[];
  wings: PublicPilotWingDto[];
  certificates: PublicPilotCertificateDto[];
  membership: PublicPilotMembershipDto | null;
  instructorListed: boolean;
};
