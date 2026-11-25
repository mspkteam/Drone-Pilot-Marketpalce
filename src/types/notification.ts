export const NOTIFICATION_TYPES = [
  "welcome",
  "job_submitted",
  "job_approved",
  "job_rejected",
  "bid_received",
  "bid_accepted",
  "booking_status",
  "booking_completed",
  "review_received",
  "message_received",
  "dispute_update",
  "squadron_vote",
  "verification_approved",
  "verification_rejected",
  "wing_request",
  "wing_earned",
  "support_chat",
  "instructor_invite",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Always email when SMTP is configured (ignore preference opt-outs). */
export const CRITICAL_EMAIL_NOTIFICATION_TYPES = [
  "dispute_update",
  "squadron_vote",
  "verification_approved",
  "verification_rejected",
  "bid_accepted",
  "booking_completed",
  "job_approved",
  "job_rejected",
  "wing_earned",
  "wing_request",
  "job_submitted",
  "instructor_invite",
  "support_chat",
] as const satisfies readonly NotificationType[];

export type NotificationDto = {
  id: string;
  userId: string;
  type: NotificationType;
  channel: string;
  title: string;
  body: string;
  payload: Record<string, unknown> | null;
  href: string | null;
  status: string;
  readAt: string | null;
  sentAt: string;
  createdAt: string;
};
