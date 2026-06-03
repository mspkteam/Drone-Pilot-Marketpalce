import type { MembershipTierDto } from "@/types/membership";

export const SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "cancelled",
  "expired",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

/** @deprecated Use MembershipTierDto — kept as alias during migration */
export type SubscriptionPlanDto = MembershipTierDto;

export type PilotSubscriptionDto = {
  id: string;
  pilotProfileId: string;
  subscriptionPlanId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  externalSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
  plan: MembershipTierDto;
};
