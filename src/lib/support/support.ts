import { randomBytes } from "crypto";
import type { SupportChat, SupportChatMessage } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { notifyAsync, sendNotification } from "@/lib/notifications/notify";
import {
  buildSupportFileName,
  validateSupportFileBuffer,
  writeSupportFile,
} from "@/lib/support/storage";
import {
  SUPPORT_CONFIRMATION_MESSAGE,
  SUPPORT_INACTIVITY_CLOSE_MESSAGE,
} from "@/lib/support/constants";
import {
  clearSupportTyping,
  isSupportPartyTyping,
  pulseSupportTyping,
} from "@/lib/support/typing";
import type {
  AdminSupportChatListItemDto,
  SupportChatDto,
  SupportChatMessageDto,
  SupportChatStatus,
  SupportChatThreadDto,
  SupportRequesterRole,
  SupportSenderRole,
} from "@/types/support";
import {
  SUPPORT_CHAT_STATUSES,
  SUPPORT_REQUESTER_ROLES,
} from "@/types/support";
import type { UserRole } from "@/types/roles";
import { isFullAdminRole } from "@/types/roles";
import { isAdminRole } from "@/types/roles";

function toMessageDto(m: SupportChatMessage): SupportChatMessageDto {
  return {
    id: m.id,
    supportChatId: m.supportChatId,
    senderUserId: m.senderUserId,
    senderRole: m.senderRole as SupportSenderRole,
    senderName: m.senderName,
    message: m.message,
    attachmentUrl: m.attachmentUrl,
    attachmentFileName: m.attachmentFileName,
    attachmentMimeType: m.attachmentMimeType,
    isSystem: m.isSystem,
    createdAt: m.createdAt.toISOString(),
  };
}

function toChatDto(
  c: SupportChat,
  options?: { includeGuestToken?: boolean },
): SupportChatDto {
  const dto: SupportChatDto = {
    id: c.id,
    requesterUserId: c.requesterUserId,
    requesterRole: c.requesterRole as SupportRequesterRole,
    requesterName: c.requesterName,
    requesterEmail: c.requesterEmail,
    subject: c.subject,
    initialMessage: c.initialMessage,
    status: c.status as SupportChatStatus,
    assignedAdminId: c.assignedAdminId,
    lastMessageAt: c.lastMessageAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
  if (options?.includeGuestToken && c.guestToken) {
    dto.guestToken = c.guestToken;
  }
  return dto;
}

export function mapUserRoleToRequesterRole(
  role: UserRole | undefined,
): SupportRequesterRole | null {
  if (!role || role === "moderator") return null;
  if (role === "super_admin" || role === "admin") return "admin";
  if (SUPPORT_REQUESTER_ROLES.includes(role as SupportRequesterRole)) {
    return role as SupportRequesterRole;
  }
  return null;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateSupportIntake(input: {
  requesterName: string;
  requesterEmail: string;
  message: string;
}) {
  const requesterName = input.requesterName.trim();
  const requesterEmail = input.requesterEmail.trim().toLowerCase();
  const message = input.message.trim();

  if (requesterName.length < 2) {
    return { ok: false as const, error: "Full name is required." };
  }
  if (!isValidEmail(requesterEmail)) {
    return { ok: false as const, error: "A valid email is required." };
  }
  if (message.length < 10) {
    return {
      ok: false as const,
      error: "Message must be at least 10 characters.",
    };
  }
  return {
    ok: true as const,
    data: { requesterName, requesterEmail, message },
  };
}

async function notifyAdminsNewSupportChat(
  chatId: string,
  requesterName: string,
) {
  const admins = await prisma.user.findMany({
    where: { role: { in: ["super_admin", "admin", "moderator"] }, status: "active" },
    select: { id: true },
  });
  for (const admin of admins) {
    notifyAsync(async () => {
      await sendNotification({
        userId: admin.id,
        type: "support_chat",
        title: "New support chat",
        body: `${requesterName} started a support conversation.`,
        payload: { supportChatId: chatId },
        sendEmail: false,
      });
    });
  }
}

export async function createSupportChat(input: {
  requesterName: string;
  requesterEmail: string;
  message: string;
  requesterUserId?: string | null;
  requesterRole: SupportRequesterRole;
  attachment?: {
    buffer: Buffer;
    mime: string;
    originalName: string;
  } | null;
}): Promise<
  | { ok: true; chat: SupportChatThreadDto; guestToken?: string }
  | { ok: false; error: string; status: 400 | 403 }
> {
  const validated = validateSupportIntake(input);
  if (!validated.ok) {
    return { ok: false, error: validated.error, status: 400 };
  }

  const guestToken =
    input.requesterRole === "guest"
      ? randomBytes(24).toString("hex")
      : null;

  const now = new Date();

  let chat: SupportChat;
  try {
    chat = await prisma.$transaction(async (tx) => {
      const created = await tx.supportChat.create({
        data: {
          requesterUserId: input.requesterUserId ?? null,
          guestToken,
          requesterRole: input.requesterRole,
          requesterName: validated.data.requesterName,
          requesterEmail: validated.data.requesterEmail,
          initialMessage: validated.data.message,
          status: "open",
          lastMessageAt: now,
        },
      });

      const firstMessage = await tx.supportChatMessage.create({
        data: {
          supportChatId: created.id,
          senderUserId: input.requesterUserId ?? null,
          senderRole: input.requesterRole,
          senderName: validated.data.requesterName,
          message: validated.data.message,
        },
      });

      if (input.attachment) {
        const fileCheck = validateSupportFileBuffer(
          input.attachment.buffer,
          input.attachment.mime,
        );
        if (!fileCheck.ok) {
          throw new Error(fileCheck.error);
        }
        const storedName = buildSupportFileName(firstMessage.id, fileCheck.mime);
        await writeSupportFile(storedName, input.attachment.buffer);
        await tx.supportChatMessage.update({
          where: { id: firstMessage.id },
          data: {
            attachmentUrl: storedName,
            attachmentFileName: input.attachment.originalName,
            attachmentMimeType: fileCheck.mime,
          },
        });
      }

      await tx.supportChatMessage.create({
        data: {
          supportChatId: created.id,
          senderRole: "system",
          senderName: "Support",
          message: SUPPORT_CONFIRMATION_MESSAGE,
          isSystem: true,
        },
      });

      return created;
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create chat.";
    return { ok: false, error: message, status: 400 };
  }

  notifyAdminsNewSupportChat(chat.id, validated.data.requesterName);

  const thread = await getSupportChatThreadForRequester(
    chat.id,
    input.requesterUserId ?? null,
    guestToken,
  );

  if (!thread) {
    return { ok: false, error: "Failed to load support chat.", status: 400 };
  }

  return {
    ok: true,
    chat: thread,
    guestToken: guestToken ?? undefined,
  };
}

async function canRequesterAccessChat(
  chat: SupportChat,
  userId: string | null,
  guestToken: string | null | undefined,
) {
  if (userId && chat.requesterUserId === userId) return true;
  if (guestToken && chat.guestToken === guestToken) return true;
  return false;
}

export async function getSupportChatThreadForRequester(
  chatId: string,
  userId: string | null,
  guestToken?: string | null,
): Promise<SupportChatThreadDto | null> {
  const chat = await prisma.supportChat.findUnique({
    where: { id: chatId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!chat) return null;
  if (!(await canRequesterAccessChat(chat, userId, guestToken))) return null;

  return {
    ...toChatDto(chat),
    messages: chat.messages.map(toMessageDto),
    canReply: true,
    canManageStatus: false,
    otherPartyTyping: isSupportPartyTyping(chatId, "support"),
  };
}

export async function pulseRequesterTyping(
  chatId: string,
  userId: string | null,
  guestToken?: string | null,
): Promise<{ ok: true } | { ok: false; error: string; status: 403 | 404 }> {
  const chat = await prisma.supportChat.findUnique({ where: { id: chatId } });
  if (!chat) {
    return { ok: false, error: "Support chat not found.", status: 404 };
  }
  if (!(await canRequesterAccessChat(chat, userId, guestToken))) {
    return { ok: false, error: "Access denied.", status: 403 };
  }
  pulseSupportTyping(chatId, "requester");
  return { ok: true };
}

export async function pulseAdminTyping(
  chatId: string,
): Promise<{ ok: true } | { ok: false; error: string; status: 404 }> {
  const chat = await prisma.supportChat.findUnique({ where: { id: chatId } });
  if (!chat) {
    return { ok: false, error: "Support chat not found.", status: 404 };
  }
  pulseSupportTyping(chatId, "support");
  return { ok: true };
}

export async function listSupportChatsForRequester(
  userId: string,
): Promise<SupportChatDto[]> {
  const chats = await prisma.supportChat.findMany({
    where: { requesterUserId: userId },
    orderBy: { lastMessageAt: "desc" },
    take: 20,
  });
  return chats.map((c) => toChatDto(c));
}

export async function sendSupportMessageAsRequester(
  chatId: string,
  input: {
    userId: string | null;
    guestToken?: string | null;
    senderRole: SupportRequesterRole;
    senderName: string;
    message: string;
    attachment?: {
      buffer: Buffer;
      mime: string;
      originalName: string;
    } | null;
  },
): Promise<
  | { ok: true; message: SupportChatMessageDto }
  | { ok: false; error: string; status: 403 | 404 | 400 }
> {
  const text = input.message.trim();
  if (text.length < 1 && !input.attachment) {
    return { ok: false, error: "Message or attachment is required.", status: 400 };
  }

  const chat = await prisma.supportChat.findUnique({ where: { id: chatId } });
  if (!chat) {
    return { ok: false, error: "Support chat not found.", status: 404 };
  }
  if (!(await canRequesterAccessChat(chat, input.userId, input.guestToken))) {
    return { ok: false, error: "Access denied.", status: 403 };
  }
  if (chat.status === "closed") {
    return { ok: false, error: "This support chat is closed.", status: 400 };
  }

  const created = await prisma.supportChatMessage.create({
    data: {
      supportChatId: chatId,
      senderUserId: input.userId,
      senderRole: input.senderRole,
      senderName: input.senderName,
      message: text || "(attachment)",
    },
  });

  let attachmentUrl: string | null = null;
  if (input.attachment) {
    const fileCheck = validateSupportFileBuffer(
      input.attachment.buffer,
      input.attachment.mime,
    );
    if (!fileCheck.ok) {
      return { ok: false, error: fileCheck.error, status: 400 };
    }
    const storedName = buildSupportFileName(created.id, fileCheck.mime);
    await writeSupportFile(storedName, input.attachment.buffer);
    attachmentUrl = storedName;
    await prisma.supportChatMessage.update({
      where: { id: created.id },
      data: {
        attachmentUrl: storedName,
        attachmentFileName: input.attachment.originalName,
        attachmentMimeType: fileCheck.mime,
      },
    });
  }

  await prisma.supportChat.update({
    where: { id: chatId },
    data: {
      lastMessageAt: new Date(),
      status: chat.status === "resolved" ? "open" : chat.status,
    },
  });

  clearSupportTyping(chatId, "requester");
  notifyAdminsNewSupportChat(chatId, input.senderName);

  const row = await prisma.supportChatMessage.findUnique({
    where: { id: created.id },
  });
  return { ok: true, message: toMessageDto(row!) };
}

export async function listSupportChatsForAdmin(
  filter?: SupportChatStatus | "all",
): Promise<AdminSupportChatListItemDto[]> {
  const where =
    filter && filter !== "all" ? { status: filter } : undefined;

  const chats = await prisma.supportChat.findMany({
    where,
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { lastMessageAt: "desc" },
    take: 100,
  });

  const chatIds = chats.map((c) => c.id);
  const chatsWithAttachments =
    chatIds.length > 0
      ? await prisma.supportChatMessage.findMany({
          where: {
            supportChatId: { in: chatIds },
            attachmentUrl: { not: null },
          },
          select: { supportChatId: true },
          distinct: ["supportChatId"],
        })
      : [];
  const attachmentChatIds = new Set(
    chatsWithAttachments.map((r) => r.supportChatId),
  );

  return chats.map((c) => {
    const last = c.messages[0];
    const unreadForAdmin =
      last != null &&
      !last.isSystem &&
      last.senderRole !== "admin" &&
      c.status !== "closed";

    return {
      id: c.id,
      requesterName: c.requesterName,
      requesterEmail: c.requesterEmail,
      requesterRole: c.requesterRole as SupportRequesterRole,
      status: c.status as SupportChatStatus,
      initialMessage: c.initialMessage,
      lastMessagePreview: last?.message ?? c.initialMessage,
      lastMessageAt: c.lastMessageAt.toISOString(),
      createdAt: c.createdAt.toISOString(),
      unreadForAdmin,
      hasAttachment: attachmentChatIds.has(c.id),
    };
  });
}

export async function getSupportChatForAdmin(
  chatId: string,
  viewerRole: UserRole,
): Promise<SupportChatThreadDto | null> {
  if (!isAdminRole(viewerRole)) return null;

  const chat = await prisma.supportChat.findUnique({
    where: { id: chatId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!chat) return null;

  const canManage = isFullAdminRole(viewerRole);

  return {
    ...toChatDto(chat),
    messages: chat.messages.map(toMessageDto),
    canReply: canManage,
    canManageStatus: canManage,
    otherPartyTyping: isSupportPartyTyping(chatId, "requester"),
  };
}

export async function sendSupportMessageAsAdmin(
  chatId: string,
  adminUserId: string,
  adminName: string,
  message: string,
  attachment?: {
    buffer: Buffer;
    mime: string;
    originalName: string;
  } | null,
): Promise<
  | { ok: true; message: SupportChatMessageDto }
  | { ok: false; error: string; status: 403 | 404 | 400 }
> {
  const text = message.trim();
  if (text.length < 1 && !attachment) {
    return { ok: false, error: "Message or attachment is required.", status: 400 };
  }

  const chat = await prisma.supportChat.findUnique({ where: { id: chatId } });
  if (!chat) {
    return { ok: false, error: "Support chat not found.", status: 404 };
  }

  const created = await prisma.supportChatMessage.create({
    data: {
      supportChatId: chatId,
      senderUserId: adminUserId,
      senderRole: "admin",
      senderName: adminName,
      message: text || "(attachment)",
    },
  });

  if (attachment) {
    const fileCheck = validateSupportFileBuffer(
      attachment.buffer,
      attachment.mime,
    );
    if (!fileCheck.ok) {
      return { ok: false, error: fileCheck.error, status: 400 };
    }
    const storedName = buildSupportFileName(created.id, fileCheck.mime);
    await writeSupportFile(storedName, attachment.buffer);
    await prisma.supportChatMessage.update({
      where: { id: created.id },
      data: {
        attachmentUrl: storedName,
        attachmentFileName: attachment.originalName,
        attachmentMimeType: fileCheck.mime,
      },
    });
  }

  await prisma.supportChat.update({
    where: { id: chatId },
    data: {
      lastMessageAt: new Date(),
      assignedAdminId: adminUserId,
      status: chat.status === "open" ? "pending" : chat.status,
    },
  });

  clearSupportTyping(chatId, "support");

  if (chat.requesterUserId) {
    notifyAsync(async () => {
      await sendNotification({
        userId: chat.requesterUserId!,
        type: "support_chat",
        title: "Support replied",
        body: "Our support team sent you a new message.",
        payload: { supportChatId: chatId },
        sendEmail: false,
      });
    });
  }

  const row = await prisma.supportChatMessage.findUnique({
    where: { id: created.id },
  });
  return { ok: true, message: toMessageDto(row!) };
}

export async function closeSupportChatForInactivity(
  chatId: string,
  userId: string | null,
  guestToken?: string | null,
): Promise<
  | { ok: true; chat: SupportChatThreadDto }
  | { ok: false; error: string; status: 403 | 404 | 400 }
> {
  const chat = await prisma.supportChat.findUnique({ where: { id: chatId } });
  if (!chat) {
    return { ok: false, error: "Support chat not found.", status: 404 };
  }
  if (!(await canRequesterAccessChat(chat, userId, guestToken))) {
    return { ok: false, error: "Access denied.", status: 403 };
  }
  if (chat.status === "closed") {
    const thread = await getSupportChatThreadForRequester(
      chatId,
      userId,
      guestToken,
    );
    if (!thread) {
      return { ok: false, error: "Support chat not found.", status: 404 };
    }
    return { ok: true, chat: thread };
  }

  await prisma.$transaction(async (tx) => {
    await tx.supportChatMessage.create({
      data: {
        supportChatId: chatId,
        senderRole: "system",
        senderName: "Support",
        message: SUPPORT_INACTIVITY_CLOSE_MESSAGE,
        isSystem: true,
      },
    });
    await tx.supportChat.update({
      where: { id: chatId },
      data: { status: "closed", lastMessageAt: new Date() },
    });
  });

  clearSupportTyping(chatId, "requester");

  const thread = await getSupportChatThreadForRequester(
    chatId,
    userId,
    guestToken,
  );
  if (!thread) {
    return { ok: false, error: "Failed to load support chat.", status: 400 };
  }
  return { ok: true, chat: thread };
}

export async function updateSupportChatStatus(
  chatId: string,
  status: SupportChatStatus,
): Promise<
  | { ok: true; chat: SupportChatDto }
  | { ok: false; error: string; status: 400 | 404 }
> {
  if (!SUPPORT_CHAT_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status.", status: 400 };
  }

  const updated = await prisma.supportChat.update({
    where: { id: chatId },
    data: { status },
  });

  return { ok: true, chat: toChatDto(updated) };
}

export function isValidSupportStatus(
  value: string,
): value is SupportChatStatus {
  return (SUPPORT_CHAT_STATUSES as readonly string[]).includes(value);
}
