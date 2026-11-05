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

/**
 * Posted support hours / SLA (client policy).
 * Live chat is staffed — no automated chat replies.
 */
export const SUPPORT_HOURS_NOTICE =
  "Support hours: Monday–Friday, 9:00 AM–5:00 PM Central Time (CST). Closed Saturdays, Sundays, and all U.S. federal holidays. Live support — no automated replies. Please allow up to 48 hours for a reply on weekdays, and up to 72 hours for requests submitted on weekends or holidays.";

/** @deprecated Auto confirmation disabled — hours notice is shown in the UI instead. */
export const SUPPORT_CONFIRMATION_MESSAGE = SUPPORT_HOURS_NOTICE;

export const SUPPORT_RESOLVED_USER_MESSAGE =
  "Your issue has been marked as resolved. You can still send a follow-up below if you need anything else.";

export const SUPPORT_CLOSED_USER_MESSAGE =
  "Your issue has been resolved and this chat is now closed. You cannot send more messages here.";

/** Close chat when the requester has not sent a message for this long (ms). */
export const SUPPORT_INACTIVITY_CLOSE_MS = 5 * 60 * 1000;

export const SUPPORT_INACTIVITY_CLOSE_MESSAGE =
  "This chat was closed after 5 minutes without a reply. Start a new support chat if you still need help.";
