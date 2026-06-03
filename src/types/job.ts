export const JOB_STATUSES = [
  "draft",
  "pending_approval",
  "approved",
  "rejected",
  "open",
  "in_bidding",
  "assigned",
  "closed",
  "cancelled",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

/** Client-editable statuses in M06 */
export const CLIENT_EDITABLE_JOB_STATUSES = ["draft", "rejected"] as const;

export const JOB_CATEGORIES = [
  { id: "aerial_video", label: "Aerial video & photography" },
  { id: "real_estate", label: "Real estate" },
  { id: "inspection", label: "Inspections" },
  { id: "surveying", label: "Surveying & mapping" },
  { id: "events", label: "Events" },
  { id: "agriculture", label: "Agriculture" },
  { id: "other", label: "Other" },
] as const;

export type JobCategoryId = (typeof JOB_CATEGORIES)[number]["id"];

export type JobDto = {
  id: string;
  clientProfileId: string;
  title: string;
  description: string;
  category: JobCategoryId;
  locationLabel: string;
  locationCity: string | null;
  locationRegion: string | null;
  locationCountry: string | null;
  scheduledDate: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  requirements: string | null;
  status: JobStatus;
  rejectionReason: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
