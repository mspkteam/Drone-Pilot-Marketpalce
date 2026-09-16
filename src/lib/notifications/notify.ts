import type { Notification } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { parseClientProfilePreferences } from "@/lib/client/preferences";
import { emailUser } from "@/lib/notifications/email";
import { getNotificationHref } from "@/lib/notifications/routes";
import { parseProfileExtrasJson } from "@/lib/pilot/profile-extras";
import type { NotificationDto, NotificationType } from "@/types/notification";
import type { UserRole } from "@/types/roles";

export function toNotificationDto(
  n: Notification,
  options?: { role?: UserRole },
): NotificationDto {
  let payload: Record<string, unknown> | null = null;
  if (n.payload) {
    try {
      payload = JSON.parse(n.payload) as Record<string, unknown>;
    } catch {
      payload = null;
    }
  }
  const type = n.type as NotificationType;
  const href =
    options?.role != null
      ? getNotificationHref(type, payload, options.role)
      : null;

  return {
    id: n.id,
    userId: n.userId,
    type,
    channel: n.channel,
    title: n.title,
    body: n.body,
    payload,
    href,
    status: n.status,
    readAt: n.readAt?.toISOString() ?? null,
    sentAt: n.sentAt.toISOString(),
    createdAt: n.createdAt.toISOString(),
  };
}

export type NotifyInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  payload?: Record<string, unknown>;
  sendEmail?: boolean;
};

function pilotPrefAllowsEmail(
  type: NotificationType,
  prefs: ReturnType<typeof parseProfileExtrasJson>["notifications"],
): boolean {
  switch (type) {
    case "job_submitted":
    case "job_approved":
    case "job_rejected":
    case "bid_received":
    case "bid_accepted":
      return prefs.jobAlerts;
    case "message_received":
    case "support_chat":
      return prefs.messages;
    case "booking_status":
    case "booking_completed":
    case "review_received":
    case "dispute_update":
      return prefs.contracts;
    case "verification_approved":
    case "verification_rejected":
    case "wing_earned":
    case "welcome":
      return prefs.membership;
    default:
      return true;
  }
}

function clientPrefAllowsEmail(
  type: NotificationType,
  prefs: NonNullable<
    ReturnType<typeof parseClientProfilePreferences>["notifications"]
  >,
): boolean {
  switch (type) {
    case "bid_received":
      return prefs.emailUpdates && prefs.newBids;
    case "message_received":
    case "support_chat":
      return prefs.messages;
    case "job_submitted":
    case "job_approved":
    case "job_rejected":
    case "booking_status":
    case "booking_completed":
    case "dispute_update":
    case "review_received":
      return prefs.emailUpdates && prefs.projectUpdates;
    default:
      return prefs.emailUpdates;
  }
}

async function shouldSendEmail(
  userId: string,
  type: NotificationType,
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      pilotProfile: { select: { profileExtrasJson: true } },
      clientProfile: { select: { preferencesJson: true } },
    },
  });
  if (!user) return true;

  if (user.role === "pilot" && user.pilotProfile) {
    const extras = parseProfileExtrasJson(user.pilotProfile.profileExtrasJson);
    return pilotPrefAllowsEmail(type, extras.notifications);
  }

  if (user.role === "client" && user.clientProfile) {
    const prefs = parseClientProfilePreferences(
      user.clientProfile.preferencesJson,
    );
    if (!prefs.notifications) return true;
    return clientPrefAllowsEmail(type, prefs.notifications);
  }

  return true;
}

export async function sendNotification(input: NotifyInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      channel: "in_app",
      title: input.title,
      body: input.body,
      payload: input.payload ? JSON.stringify(input.payload) : null,
      status: "sent",
    },
  });

  if (input.sendEmail !== false) {
    const allow = await shouldSendEmail(input.userId, input.type);
    if (allow) {
      await emailUser(input.userId, input.title, input.body);
    }
  }

  return toNotificationDto(notification);
}

/** Fire-and-forget — never throws to API callers. */
export function notifyAsync(fn: () => Promise<void>) {
  void fn().catch((err) => {
    console.error("[notify]", err);
  });
}

export async function listNotificationsForUser(
  userId: string,
  options?: { unreadOnly?: boolean; limit?: number; role?: UserRole },
) {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      channel: "in_app",
      ...(options?.unreadOnly ? { readAt: null } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
  });
  return notifications.map((n) =>
    toNotificationDto(n, { role: options?.role }),
  );
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, channel: "in_app", readAt: null },
  });
}

export async function markNotificationRead(notificationId: string, userId: string) {
  const updated = await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date(), status: "read" },
  });
  return updated.count > 0;
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, channel: "in_app", readAt: null },
    data: { readAt: new Date(), status: "read" },
  });
}
