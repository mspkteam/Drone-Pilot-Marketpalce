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

/** Max files selectable per message / new chat. */
export const SUPPORT_MAX_ATTACHMENTS = 5;

export const SUPPORT_CONFIRMATION_MESSAGE =
  "Thanks for reaching out. Our support team will catch up with you within 10–15 minutes. You can keep this chat open and continue the conversation here.";

export const SUPPORT_RESOLVED_USER_MESSAGE =
  "Your issue has been marked as resolved. You can still send a follow-up below if you need anything else.";

export const SUPPORT_CLOSED_USER_MESSAGE =
  "Your issue has been resolved and this chat is now closed. You cannot send more messages here.";

/** Close chat when the requester has not sent a message for this long (ms). */
export const SUPPORT_INACTIVITY_CLOSE_MS = 5 * 60 * 1000;

export const SUPPORT_INACTIVITY_CLOSE_MESSAGE =
  "This chat was closed after 5 minutes without a reply. Start a new support chat if you still need help.";
