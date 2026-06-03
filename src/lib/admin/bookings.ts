import { prisma } from "@/lib/db";
import { toListItem } from "@/lib/bookings/booking";
import { recordPaymentForCompletedBooking } from "@/lib/payments/payment";
import {
  triggerBookingCompleted,
  triggerBookingStatus,
} from "@/lib/notifications/triggers";
import type { BookingListItemDto } from "@/types/booking";
import { BOOKING_STATUSES, type BookingStatus } from "@/types/booking";

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
} as const;

export async function listBookingsForAdmin(
  filter?: BookingStatus | "all",
): Promise<BookingListItemDto[]> {
  const where =
    filter && filter !== "all" ? { status: filter } : undefined;

  const bookings = await prisma.booking.findMany({
    where,
    include: bookingInclude,
    orderBy: { updatedAt: "desc" },
  });

  return bookings.map(toListItem);
}

export function isValidBookingFilter(
  value: string,
): value is BookingStatus | "all" {
  return value === "all" || BOOKING_STATUSES.includes(value as BookingStatus);
}

export async function updateBookingStatusForAdmin(
  bookingId: string,
  newStatus: BookingStatus,
): Promise<
  | { ok: true; booking: BookingListItemDto }
  | { ok: false; error: string; status: 400 | 404 }
> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      job: { select: { title: true } },
      clientProfile: { select: { userId: true } },
      pilotProfile: { select: { userId: true } },
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
    triggerBookingCompleted(
      booking.clientProfile.userId,
      booking.pilotProfile.userId,
      booking.job.title,
      bookingId,
    );
  } else if (newStatus === "cancelled") {
    data.cancelledAt = now;
    await prisma.booking.update({ where: { id: bookingId }, data });
    triggerBookingStatus(
      booking.pilotProfile.userId,
      "Booking cancelled",
      `An admin cancelled the booking for "${booking.job.title}".`,
      bookingId,
    );
    triggerBookingStatus(
      booking.clientProfile.userId,
      "Booking cancelled",
      `An admin cancelled the booking for "${booking.job.title}".`,
      bookingId,
    );
  } else {
    await prisma.booking.update({ where: { id: bookingId }, data });
    const label = newStatus.replace("_", " ");
    const body = `An admin updated the booking for "${booking.job.title}" to ${label}.`;
    triggerBookingStatus(
      booking.pilotProfile.userId,
      "Booking updated",
      body,
      bookingId,
    );
    triggerBookingStatus(
      booking.clientProfile.userId,
      "Booking updated",
      body,
      bookingId,
    );
  }

  const updated = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: bookingInclude,
  });

  return { ok: true, booking: toListItem(updated) };
}
