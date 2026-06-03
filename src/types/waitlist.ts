export const WAITLIST_ROLE_INTERESTS = [
  "pilot",
  "client",
  "both",
] as const;

export type WaitlistRoleInterest = (typeof WAITLIST_ROLE_INTERESTS)[number];

export const WAITLIST_STATUSES = ["subscribed", "unsubscribed"] as const;

export type WaitlistStatus = (typeof WAITLIST_STATUSES)[number];

export type WaitlistEntryDto = {
  id: string;
  email: string;
  name: string | null;
  roleInterest: WaitlistRoleInterest;
  region: string | null;
  source: string | null;
  status: WaitlistStatus;
  createdAt: string;
  updatedAt: string;
};
