export const USER_ACCOUNT_STATUSES = [
  "active",
  "pending",
  "suspended",
  "deleted",
] as const;

export type UserAccountStatus = (typeof USER_ACCOUNT_STATUSES)[number];

export type AdminUserEditDto = {
  id: string;
  email: string;
  role: string;
  status: string;
  memberNumber: string | null;
  moderationNote: string | null;
  createdAt: string;
  pilot: {
    id: string;
    displayName: string;
    licenseNumber: string;
    licenseCountry: string | null;
    status: string;
    isPublic: boolean;
    bio: string | null;
    locationCity: string | null;
    locationRegion: string | null;
    locationCountry: string | null;
    serviceRadiusKm: number | null;
    hourlyRateMin: number | null;
    hourlyRateMax: number | null;
  } | null;
  client: {
    id: string;
    contactName: string;
    companyName: string | null;
    phone: string | null;
    billingAddress: string | null;
    status: string;
  } | null;
};
