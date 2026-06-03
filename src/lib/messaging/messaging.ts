import type { Conversation, Message } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { notifyAsync, sendNotification } from "@/lib/notifications/notify";
import type {
  ConversationDetailDto,
  ConversationListItemDto,
  EligibleApplicationDto,
  MessageDto,
} from "@/types/messaging";

const MAX_MESSAGE_LENGTH = 5000;

const conversationInclude = {
  job: { select: { id: true, title: true } },
  pilotProfile: { select: { id: true, displayName: true, userId: true } },
  clientProfile: { select: { id: true, contactName: true, userId: true } },
  booking: { select: { id: true } },
} as const;

function previewBody(body: string) {
  const t = body.trim();
  return t.length > 80 ? `${t.slice(0, 80)}…` : t;
}

async function getUnreadCount(
  conversationId: string,
  userId: string,
  lastReadAt: Date | null,
) {
  return prisma.message.count({
    where: {
      conversationId,
      senderUserId: { not: userId },
      ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
    },
  });
}

async function getLastReadAt(conversationId: string, userId: string) {
  const state = await prisma.conversationReadState.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  return state?.lastReadAt ?? null;
}

async function toListItem(
  c: Conversation & {
    job: { id: string; title: string };
    pilotProfile: { id: string; displayName: string; userId: string };
    clientProfile: { id: string; contactName: string; userId: string };
    booking: { id: string } | null;
    messages: { body: string; createdAt: Date }[];
  },
  viewerUserId: string,
  counterpartName: string,
): Promise<ConversationListItemDto> {
  const last = c.messages[0] ?? null;
  const lastReadAt = await getLastReadAt(c.id, viewerUserId);
  const unreadCount = await getUnreadCount(c.id, viewerUserId, lastReadAt);

  return {
    id: c.id,
    jobId: c.jobId,
    jobTitle: c.job.title,
    jobApplicationId: c.jobApplicationId,
    bookingId: c.booking?.id ?? c.bookingId,
    pilotProfileId: c.pilotProfileId,
    clientProfileId: c.clientProfileId,
    counterpartName,
    lastMessagePreview: last ? previewBody(last.body) : null,
    lastMessageAt: (c.lastMessageAt ?? last?.createdAt)?.toISOString() ?? null,
    unreadCount,
    createdAt: c.createdAt.toISOString(),
  };
}

export async function listConversationsForClient(
  clientProfileId: string,
  userId: string,
) {
  const rows = await prisma.conversation.findMany({
    where: { clientProfileId },
    include: {
      ...conversationInclude,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
  });

  return Promise.all(
    rows.map((c) =>
      toListItem(c, userId, c.pilotProfile.displayName),
    ),
  );
}

export async function listConversationsForPilot(
  pilotProfileId: string,
  userId: string,
) {
  const rows = await prisma.conversation.findMany({
    where: { pilotProfileId },
    include: {
      ...conversationInclude,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
  });

  return Promise.all(
    rows.map((c) =>
      toListItem(c, userId, c.clientProfile.contactName),
    ),
  );
}

export async function listConversationsForAdmin() {
  const rows = await prisma.conversation.findMany({
    include: {
      ...conversationInclude,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
  });

  return rows.map((c) => ({
    id: c.id,
    jobId: c.jobId,
    jobTitle: c.job.title,
    jobApplicationId: c.jobApplicationId,
    bookingId: c.booking?.id ?? c.bookingId,
    clientName: c.clientProfile.contactName,
    pilotName: c.pilotProfile.displayName,
    lastMessagePreview: c.messages[0]
      ? previewBody(c.messages[0].body)
      : null,
    lastMessageAt: (c.lastMessageAt ?? c.messages[0]?.createdAt)?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  }));
}

export async function listEligibleApplicationsForClient(clientProfileId: string) {
  const applications = await prisma.jobApplication.findMany({
    where: {
      job: { clientProfileId },
      status: { in: ["submitted", "accepted"] },
      conversation: null,
    },
    include: {
      job: { select: { id: true, title: true } },
      pilotProfile: { select: { displayName: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return applications.map(
    (a): EligibleApplicationDto => ({
      id: a.id,
      jobId: a.jobId,
      jobTitle: a.job.title,
      pilotName: a.pilotProfile.displayName,
      proposedAmount: a.proposedAmount,
      currency: a.currency,
      submittedAt: a.submittedAt.toISOString(),
    }),
  );
}

export async function createConversationAsClient(
  clientProfileId: string,
  clientUserId: string,
  jobApplicationId: string,
): Promise<
  | { ok: true; conversation: ConversationListItemDto }
  | { ok: false; error: string; status: 400 | 403 | 404 | 409 }
> {
  const application = await prisma.jobApplication.findFirst({
    where: { id: jobApplicationId },
    include: {
      job: true,
      conversation: true,
      pilotProfile: {
        select: { displayName: true, userId: true },
      },
    },
  });

  if (!application) {
    return { ok: false, error: "Application not found.", status: 404 };
  }

  if (application.job.clientProfileId !== clientProfileId) {
    return { ok: false, error: "Not your job.", status: 403 };
  }

  if (application.conversation) {
    const existing = await listConversationsForClient(clientProfileId, clientUserId);
    const found = existing.find((c) => c.jobApplicationId === jobApplicationId);
    if (found) {
      return { ok: true, conversation: found };
    }
  }

  const conversation = await prisma.conversation.create({
    data: {
      jobId: application.jobId,
      jobApplicationId: application.id,
      clientProfileId,
      pilotProfileId: application.pilotProfileId,
    },
    include: {
      ...conversationInclude,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const item = await toListItem(
    conversation,
    clientUserId,
    application.pilotProfile.displayName,
  );

  notifyAsync(async () => {
    await sendNotification({
      userId: application.pilotProfile.userId,
      type: "message_received",
      title: "New conversation",
      body: `A client opened a message thread about "${application.job.title}".`,
      payload: { conversationId: conversation.id, jobId: application.jobId },
    });
  });

  return { ok: true, conversation: item };
}

export async function getConversationForParticipant(
  conversationId: string,
  options: { clientProfileId?: string; pilotProfileId?: string },
  viewerUserId: string,
  viewerRole: "client" | "pilot",
): Promise<ConversationDetailDto | null> {
  const c = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      ...(options.clientProfileId
        ? { clientProfileId: options.clientProfileId }
        : {}),
      ...(options.pilotProfileId
        ? { pilotProfileId: options.pilotProfileId }
        : {}),
    },
    include: {
      ...conversationInclude,
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          senderUser: {
            select: {
              id: true,
              pilotProfile: { select: { displayName: true } },
              clientProfile: { select: { contactName: true } },
            },
          },
        },
      },
    },
  });

  if (!c) return null;

  const counterpartName =
    viewerRole === "client"
      ? c.pilotProfile.displayName
      : c.clientProfile.contactName;

  const lastMsg = c.messages.at(-1);
  const listBase = await toListItem(
    {
      ...c,
      messages: lastMsg
        ? [{ body: lastMsg.body, createdAt: lastMsg.createdAt }]
        : [],
    },
    viewerUserId,
    counterpartName,
  );

  const messages: MessageDto[] = c.messages.map((m) => {
    const isMine = m.senderUserId === viewerUserId;
    const senderLabel = isMine
      ? "You"
      : (m.senderUser.pilotProfile?.displayName ??
        m.senderUser.clientProfile?.contactName ??
        "User");
    return {
      id: m.id,
      conversationId: m.conversationId,
      senderUserId: m.senderUserId,
      senderLabel,
      isMine,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    };
  });

  return { ...listBase, messages };
}

export async function getConversationForAdmin(conversationId: string) {
  const c = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      ...conversationInclude,
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          senderUser: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!c) return null;

  return {
    id: c.id,
    jobId: c.jobId,
    jobTitle: c.job.title,
    jobApplicationId: c.jobApplicationId,
    bookingId: c.booking?.id ?? c.bookingId,
    clientName: c.clientProfile.contactName,
    pilotName: c.pilotProfile.displayName,
    createdAt: c.createdAt.toISOString(),
    messages: c.messages.map((m) => ({
      id: m.id,
      senderEmail: m.senderUser.email,
      senderRole: m.senderUser.role,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

function validateMessageBody(body: unknown):
  | { ok: true; text: string }
  | { ok: false; error: string } {
  if (typeof body !== "string") {
    return { ok: false, error: "Message body is required." };
  }
  const text = body.trim();
  if (!text) {
    return { ok: false, error: "Message cannot be empty." };
  }
  if (text.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: `Message must be at most ${MAX_MESSAGE_LENGTH} characters.` };
  }
  return { ok: true, text };
}

async function assertConversationParticipant(
  conversationId: string,
  userId: string,
  profile: { clientProfileId?: string; pilotProfileId?: string },
) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      ...(profile.clientProfileId
        ? { clientProfileId: profile.clientProfileId }
        : {}),
      ...(profile.pilotProfileId
        ? { pilotProfileId: profile.pilotProfileId }
        : {}),
    },
    include: {
      job: { select: { title: true } },
      pilotProfile: { select: { userId: true } },
      clientProfile: { select: { userId: true } },
    },
  });
}

export async function sendMessageAsParticipant(
  conversationId: string,
  senderUserId: string,
  profile: { clientProfileId?: string; pilotProfileId?: string },
  body: unknown,
): Promise<
  | { ok: true; message: MessageDto }
  | { ok: false; error: string; status: 400 | 403 | 404 }
> {
  const validated = validateMessageBody(body);
  if (!validated.ok) {
    return { ok: false, error: validated.error, status: 400 };
  }

  const conversation = await assertConversationParticipant(
    conversationId,
    senderUserId,
    profile,
  );

  if (!conversation) {
    return { ok: false, error: "Conversation not found.", status: 404 };
  }

  const message = await prisma.$transaction(async (tx) => {
    const msg = await tx.message.create({
      data: {
        conversationId,
        senderUserId,
        body: validated.text,
      },
      include: {
        senderUser: {
          select: {
            id: true,
            pilotProfile: { select: { displayName: true } },
            clientProfile: { select: { contactName: true } },
          },
        },
      },
    });

    await tx.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: msg.createdAt },
    });

    await tx.conversationReadState.upsert({
      where: {
        conversationId_userId: { conversationId, userId: senderUserId },
      },
      create: {
        conversationId,
        userId: senderUserId,
        lastReadAt: msg.createdAt,
      },
      update: { lastReadAt: msg.createdAt },
    });

    return msg;
  });

  const recipientUserId =
    senderUserId === conversation.clientProfile.userId
      ? conversation.pilotProfile.userId
      : conversation.clientProfile.userId;

  notifyAsync(async () => {
    await sendNotification({
      userId: recipientUserId,
      type: "message_received",
      title: "New message",
      body: `New message on "${conversation.job.title}".`,
      payload: { conversationId },
    });
  });

  return {
    ok: true,
    message: {
      id: message.id,
      conversationId: message.conversationId,
      senderUserId: message.senderUserId,
      senderLabel: "You",
      isMine: true,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    },
  };
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
  profile: { clientProfileId?: string; pilotProfileId?: string },
): Promise<boolean> {
  const conversation = await assertConversationParticipant(
    conversationId,
    userId,
    profile,
  );
  if (!conversation) return false;

  const now = new Date();
  await prisma.conversationReadState.upsert({
    where: { conversationId_userId: { conversationId, userId } },
    create: { conversationId, userId, lastReadAt: now },
    update: { lastReadAt: now },
  });
  return true;
}

export async function getTotalUnreadCount(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { clientProfile: { userId } },
        { pilotProfile: { userId } },
      ],
    },
    select: { id: true },
  });

  let total = 0;
  for (const { id } of conversations) {
    const lastReadAt = await getLastReadAt(id, userId);
    total += await getUnreadCount(id, userId, lastReadAt);
  }
  return total;
}

export async function linkBookingToConversation(
  jobApplicationId: string,
  bookingId: string,
) {
  await prisma.conversation.updateMany({
    where: { jobApplicationId },
    data: { bookingId },
  });
}
