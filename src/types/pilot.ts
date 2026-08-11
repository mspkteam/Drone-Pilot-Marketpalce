export const PILOT_PROFILE_STATUSES = [
  "draft",
  "pending_review",
  "approved",
  "rejected",
  "suspended",
] as const;

export type PilotProfileStatus = (typeof PILOT_PROFILE_STATUSES)[number];

export const PILOT_SERVICE_OPTIONS = [
  { id: "aerial_video", label: "Aerial video & photography" },
  { id: "real_estate", label: "Real estate" },
  { id: "inspection", label: "Inspections" },
  { id: "surveying", label: "Surveying & mapping" },
  { id: "events", label: "Events" },
  { id: "agriculture", label: "Agriculture" },
  { id: "other", label: "Other" },
] as const;

export type PilotServiceId = (typeof PILOT_SERVICE_OPTIONS)[number]["id"];

export type PilotProfileDto = {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  locationCity: string | null;
  locationRegion: string | null;
  locationCountry: string | null;
  serviceRadiusKm: number | null;
  servicesOffered: PilotServiceId[];
  hourlyRateMin: number | null;
  hourlyRateMax: number | null;
  licenseNumber: string;
  licenseCountry: string | null;
  isPublic: boolean;
  status: PilotProfileStatus;
  instructorAddonActive: boolean;
  instructorAddonPeriodEnd: string | null;
  complianceAcceptedAt: string | null;
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
