export const VERIFICATION_MAX_BYTES = 5 * 1024 * 1024;

export const VERIFICATION_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type VerificationMimeType =
  (typeof VERIFICATION_ALLOWED_MIME_TYPES)[number];

export const VERIFICATION_MIME_TO_EXT: Record<VerificationMimeType, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
