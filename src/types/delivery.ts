export const DELIVERY_STATUSES = [
  "draft",
  "submitted",
  "approved",
  "rejected",
] as const;

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export type DeliveryFileKind = "file" | "link";

export type DeliveryItem = {
  id: string;
  kind: DeliveryFileKind;
  label: string;
  url?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  storedFileName?: string;
};

export type BookingDeliveryDto = {
  id: string;
  bookingId: string;
  status: DeliveryStatus;
  notes: string | null;
  items: DeliveryItem[];
  clientFeedback: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
