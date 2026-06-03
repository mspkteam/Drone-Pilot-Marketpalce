export const SUPPORT_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export type SupportMimeType = (typeof SUPPORT_ALLOWED_MIME_TYPES)[number];

export const SUPPORT_MIME_TO_EXT: Record<SupportMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export const SUPPORT_MAX_BYTES = 5 * 1024 * 1024;

export const SUPPORT_CONFIRMATION_MESSAGE =
  "Thanks for reaching out. Our support team will catch up with you within 10–15 minutes. You can keep this chat open and continue the conversation here.";
