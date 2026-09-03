import type { Booking } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  triggerBidAccepted,
  triggerBookingCompleted,
  triggerBookingStatus,
} from "@/lib/notifications/triggers";
import { linkBookingToConversation } from "@/lib/messaging/messaging";
import { recordPaymentForCompletedBooking } from "@/lib/payments/payment";
import { evaluatePilotAwards } from "@/lib/certificates/awards";
import type { BookingDto, BookingListItemDto, BookingStatus } from "@/types/booking";
import type { DeliveryStatus } from "@/types/delivery";
import { jobAcceptsApplications } from "@/lib/bookings/status";

const bookingInclude = {
  job: {
    select: {
      id: true,
      title: true,
      locationLabel: true,
      status: true,
    },
  },
  pilotProfile: {
    select: { id: true, displayName: true },
  },
  clientProfile: {
    select: { id: true, contactName: true, companyName: true },
  },
  delivery: {
    select: { status: true },
  },
} as const;

type BookingWithRelations = Booking & {
  job: { id: string; title: string; locationLabel: string; status: string };
  pilotProfile: { id: string; displayName: string };
  clientProfile: {
    id: string;
    contactName: string;
    companyName: string | null;
  };
  delivery?: { status: string } | null;
};

export function toBookingDto(booking: Booking): BookingDto {
  return {
    id: booking.id,
    jobId: booking.jobId,
    jobApplicationId: booking.jobApplicationId,
    pilotProfileId: booking.pilotProfileId,
    clientProfileId: booking.clientProfileId,
    agreedAmount: booking.agreedAmount,
    currency: booking.currency,
    status: booking.status as BookingStatus,
    scheduledStartAt: booking.scheduledStartAt?.toISOString() ?? null,
    scheduledEndAt: booking.scheduledEndAt?.toISOString() ?? null,
    completedAt: booking.completedAt?.toISOString() ?? null,
    cancelledAt: booking.cancelledAt?.toISOString() ?? null,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}

export function toListItem(
  booking: BookingWithRelations,
  conversationId: string | null = null,
): BookingListItemDto {
  return {
    ...toBookingDto(booking),
    job: booking.job,
    pilot: booking.pilotProfile,
    client: booking.clientProfile,
    conversationId,
    deliveryStatus: (booking.delivery?.status as DeliveryStatus) ?? null,
  };
}

async function conversationIdForApplication(
  jobApplicationId: string,
): Promise<string | null> {
  const conversation = await prisma.conversation.findFirst({
    where: { jobApplicationId },
    select: { id: true },
  });
  return conversation?.id ?? null;
}

export async function getBookingForClient(bookingId: string, clientProfileId: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, clientProfileId },
    include: bookingInclude,
  });
  if (!booking) return null;
  const conversationId = await conversationIdForApplication(booking.jobApplicationId);
  return toListItem(booking, conversationId);
}

export async function getBookingForPilot(bookingId: string, pilotProfileId: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, pilotProfileId },
    include: bookingInclude,
  });
  if (!booking) return null;
  const conversationId = await conversationIdForApplication(booking.jobApplicationId);
  return toListItem(booking, conversationId);
}

export async function listBookingsForClient(clientProfileId: string) {
  const bookings = await prisma.booking.findMany({
    where: { clientProfileId },
    include: bookingInclude,
    orderBy: { updatedAt: "desc" },
  });
  return bookings.map((booking) => toListItem(booking));
}

export async function listBookingsForPilot(pilotProfileId: string) {
  const bookings = await prisma.booking.findMany({
    where: { pilotProfileId },
    include: bookingInclude,
    orderBy: { updatedAt: "desc" },
  });

  const applicationIds = bookings.map((booking) => booking.jobApplicationId);
  const conversations = applicationIds.length
    ? await prisma.conversation.findMany({
        where: { jobApplicationId: { in: applicationIds } },
        select: { id: true, jobApplicationId: true },
      })
    : [];

  const conversationByApplication = new Map(
    conversations.map((conversation) => [conversation.jobApplicationId, conversation.id]),
  );

  return bookings.map((booking) =>
    toListItem(booking, conversationByApplication.get(booking.jobApplicationId) ?? null),
  );
}

export async function getBookingByJobId(jobId: string) {
  const booking = await prisma.booking.findUnique({
    where: { jobId },
    include: bookingInclude,
  });
  return booking ? toListItem(booking) : null;
}

export async function acceptJobApplication(
  jobId: string,
  applicationId: string,
  clientProfileId: string,
): Promise<
  | { ok: true; booking: BookingListItemDto }
  | { ok: false; error: string; status: 400 | 404 | 409 }
> {
  const job = await prisma.job.findFirst({
    where: { id: jobId, clientProfileId },
    include: { booking: true },
  });

  if (!job) {
    return { ok: false, error: "Job not found.", status: 404 };
  }

  if (job.booking) {
    return {
      ok: false,
      error: "This job already has an assigned pilot.",
      status: 409,
    };
  }

  if (!jobAcceptsApplications(job.status)) {
    return {
      ok: false,
      error: "This job is not accepting offers.",
      status: 400,
    };
  }

  const application = await prisma.jobApplication.findFirst({
    where: { id: applicationId, jobId, status: "submitted" },
  });

  if (!application) {
    return {
      ok: false,
      error: "Application not found or no longer available.",
      status: 404,
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: {
        jobId,
        jobApplicationId: application.id,
        pilotProfileId: application.pilotProfileId,
        clientProfileId,
        agreedAmount: application.proposedAmount,
        currency: application.currency,
        status: "pending",
      },
      include: bookingInclude,
    });

    await tx.jobApplication.update({
      where: { id: application.id },
      data: { status: "accepted" },
    });

    await tx.jobApplication.updateMany({
      where: {
        jobId,
        id: { not: application.id },
        status: "submitted",
      },
      data: { status: "rejected" },
    });

    await tx.job.update({
      where: { id: jobId },
      data: { status: "assigned" },
    });

    return booking;
  });

  await linkBookingToConversation(application.id, result.id);

  return { ok: true, booking: toListItem(result) };
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  options: {
    clientProfileId?: string;
    pilotProfileId?: string;
  },
): Promise<
  | { ok: true; booking: BookingListItemDto }
  | { ok: false; error: string; status: 400 | 404 }
> {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      ...(options.clientProfileId
        ? { clientProfileId: options.clientProfileId }
        : {}),
      ...(options.pilotProfileId
        ? { pilotProfileId: options.pilotProfileId }
        : {}),
    },
  });

  if (!booking) {
    return { ok: false, error: "Booking not found.", status: 404 };
  }

  const now = new Date();
  const data: {
    status: string;
    completedAt?: Date | null;
    cancelledAt?: Date | null;
  } = { status: newStatus };

  if (newStatus === "completed") {
    data.completedAt = now;
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({ where: { id: bookingId }, data });
      await tx.job.update({
        where: { id: booking.jobId },
        data: { status: "closed" },
      });
    });
    await recordPaymentForCompletedBooking(bookingId);
    const completedBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { pilotProfileId: true },
    });
    if (completedBooking) {
      await evaluatePilotAwards(completedBooking.pilotProfileId);
    }
  } else if (newStatus === "cancelled") {
    data.cancelledAt = now;
    await prisma.booking.update({ where: { id: bookingId }, data });
  } else {
    await prisma.booking.update({ where: { id: bookingId }, data });
  }

  const updated = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: bookingInclude,
  });

  await notifyBookingStatusChange(bookingId, newStatus, options);

  return { ok: true, booking: toListItem(updated) };
}

async function notifyBookingStatusChange(
  bookingId: string,
  newStatus: BookingStatus,
  options: { clientProfileId?: string; pilotProfileId?: string },
) {
  const b = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      job: { select: { title: true } },
      clientProfile: { select: { userId: true } },
      pilotProfile: { select: { userId: true } },
    },
  });
  if (!b) return;

  const jobTitle = b.job.title;

  if (newStatus === "confirmed" && options.clientProfileId) {
    triggerBookingStatus(
      b.pilotProfile.userId,
      "Booking confirmed",
      `The client confirmed the booking for "${jobTitle}". You can start when ready.`,
      bookingId,
    );
  } else if (newStatus === "in_progress" && options.pilotProfileId) {
    triggerBookingStatus(
      b.clientProfile.userId,
      "Work started",
      `Your pilot has started work on "${jobTitle}".`,
      bookingId,
    );
  } else if (newStatus === "cancelled") {
    const otherUserId = options.clientProfileId
      ? b.pilotProfile.userId
      : b.clientProfile.userId;
    triggerBookingStatus(
      otherUserId,
      "Booking cancelled",
      `The booking for "${jobTitle}" was cancelled.`,
      bookingId,
    );
  } else if (newStatus === "completed") {
    triggerBookingCompleted(
      b.clientProfile.userId,
      b.pilotProfile.userId,
      jobTitle,
      bookingId,
    );
  }
}
