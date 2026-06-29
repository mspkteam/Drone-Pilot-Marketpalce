export const DELIVERY_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "application/zip",
] as const;

export type DeliveryMimeType = (typeof DELIVERY_ALLOWED_MIME_TYPES)[number];

export const DELIVERY_MIME_TO_EXT: Record<DeliveryMimeType, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "application/zip": "zip",
};

export const DELIVERY_MAX_BYTES = 50 * 1024 * 1024;
export const DELIVERY_MAX_ITEMS = 10;
