import type { SubscriptionStatus } from "@/types/subscription";

export type MembershipTierDto = {
  id: string;
  code: string;
  name: string;
  slug: string;
  priceYearly: number;
  priceMonthly: number;
  currency: string;
  jobVisibilityDelayHours: number;
  canViewJobs: boolean;
  canApply: boolean;
  instructorEligible: boolean;
  sortOrder: number;
  features: string[];
  isActive: boolean;
};

export type PilotMembershipSummaryDto = {
  subscriptionId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  tier: MembershipTierDto;
};
