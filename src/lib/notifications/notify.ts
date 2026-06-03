import type { Notification } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { emailUser } from "@/lib/notifications/email";
import type { NotificationDto, NotificationType } from "@/types/notification";

export function toNotificationDto(n: Notification): NotificationDto {
  let payload: Record<string, unknown> | null = null;
  if (n.payload) {
    try {
      payload = JSON.parse(n.payload) as Record<string, unknown>;
    } catch {
      payload = null;
    }
  }
  return {
    id: n.id,
    userId: n.userId,
    type: n.type as NotificationType,
    channel: n.channel,
    title: n.title,
    body: n.body,
    payload,
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
    await emailUser(input.userId, input.title, input.body);
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
  options?: { unreadOnly?: boolean; limit?: number },
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
  return notifications.map(toNotificationDto);
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
