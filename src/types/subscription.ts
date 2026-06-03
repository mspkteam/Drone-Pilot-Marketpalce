export const SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "cancelled",
  "expired",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export type SubscriptionPlanDto = {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  currency: string;
  features: string[];
  isActive: boolean;
};

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
  plan: SubscriptionPlanDto;
};
