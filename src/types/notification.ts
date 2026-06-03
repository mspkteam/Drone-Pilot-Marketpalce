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
  "verification_approved",
  "verification_rejected",
  "wing_earned",
  "support_chat",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

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
