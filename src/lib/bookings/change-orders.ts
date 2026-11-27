import type { BookingChangeOrder } from "@/generated/prisma/client";
import { getEffectiveCommissionRateForPilot } from "@/lib/admin/pilot-rates";
import {
  calculateCommission,
  maxAllowedJobAmount,
  validateChangeOrderAmount,
} from "@/lib/commission/constants";
import { prisma } from "@/lib/db";
import type {
  ChangeOrderDto,
  ChangeOrderStatus,
  ChangeOrderSummaryDto,
} from "@/types/change-order";

const ACTIVE_BOOKING_STATUSES = ["confirmed", "in_progress"];

export function toChangeOrderDto(row: BookingChangeOrder): ChangeOrderDto {
  return {
    id: row.id,
    bookingId: row.bookingId,
    proposedAmount: row.proposedAmount,
    deltaAmount: row.deltaAmount,
    serviceFee: row.serviceFee,
    currency: row.currency,
    status: row.status as ChangeOrderStatus,
    note: row.note,
    proposedByUserId: row.proposedByUserId,
    commissionRate: row.commissionRate,
    provider: row.provider,
    acceptedAt: row.acceptedAt?.toISOString() ?? null,
    rejectedAt: row.rejectedAt?.toISOString() ?? null,
    chargedAt: row.chargedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

type Result<T> =
  | ({ ok: true } & T)
  | { ok: false; error: string; status: 400 | 404 | 409 };

/** Locks the commission rate on the booking the first time it is needed. */
export async function ensureBookingCommissionRate(bookingId: string): Promise<number> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { commissionRate: true, pilotProfileId: true },
  });
  if (!booking) throw new Error("Booking not found.");
  if (booking.commissionRate != null) return booking.commissionRate;
  const rate = await getEffectiveCommissionRateForPilot(booking.pilotProfileId);
  await prisma.booking.update({
    where: { id: bookingId },
    data: { commissionRate: rate },
  });
  return rate;
}

function originalAmountOf(agreedAmount: number, accepted: BookingChangeOrder[]) {
  const sum = accepted
    .filter((c) => c.status === "accepted" || c.status === "charged")
    .reduce((acc, c) => acc + c.deltaAmount, 0);
  return Math.round((agreedAmount - sum) * 100) / 100;
}

export async function getChangeOrderSummary(
  bookingId: string,
): Promise<ChangeOrderSummaryDto | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { changeOrders: { orderBy: { createdAt: "desc" } } },
  });
  if (!booking) return null;
  const original = originalAmountOf(booking.agreedAmount, booking.changeOrders);
  return {
    originalAmount: original,
    currentAmount: booking.agreedAmount,
    maxAmount: maxAllowedJobAmount(original),
    commissionRate:
      booking.commissionRate ??
      (await getEffectiveCommissionRateForPilot(booking.pilotProfileId)),
    currency: booking.currency,
    changeOrders: booking.changeOrders.map(toChangeOrderDto),
  };
}

export async function proposeChangeOrder(input: {
  bookingId: string;
  pilotProfileId: string;
  pilotUserId: string;
  proposedAmount: number;
  note?: string | null;
}): Promise<Result<{ changeOrder: ChangeOrderDto }>> {
  const booking = await prisma.booking.findFirst({
    where: { id: input.bookingId, pilotProfileId: input.pilotProfileId },
    include: { changeOrders: true },
  });
  if (!booking) return { ok: false, error: "Booking not found.", status: 404 };
  if (!ACTIVE_BOOKING_STATUSES.includes(booking.status)) {
    return {
      ok: false,
      error: "Change orders can only be proposed on confirmed or in-progress bookings.",
      status: 400,
    };
  }
  if (booking.changeOrders.some((c) => c.status === "proposed")) {
    return {
      ok: false,
      error: "A change order is already awaiting client response.",
      status: 409,
    };
  }

  const original = originalAmountOf(booking.agreedAmount, booking.changeOrders);
  const check = validateChangeOrderAmount(original, booking.agreedAmount, input.proposedAmount);
  if (!check.ok) return { ok: false, error: check.error, status: 400 };

  const rate = await ensureBookingCommissionRate(booking.id);
  const row = await prisma.bookingChangeOrder.create({
    data: {
      bookingId: booking.id,
      proposedAmount: Math.round(input.proposedAmount * 100) / 100,
      deltaAmount: check.delta,
      serviceFee: check.serviceFee,
      currency: booking.currency,
      note: input.note?.trim() || null,
      proposedByUserId: input.pilotUserId,
      commissionRate: rate,
    },
  });
  return { ok: true, changeOrder: toChangeOrderDto(row) };
}

export async function respondToChangeOrder(input: {
  bookingId: string;
  changeOrderId: string;
  clientProfileId: string;
  action: "accept" | "reject";
}): Promise<Result<{ changeOrder: ChangeOrderDto }>> {
  const booking = await prisma.booking.findFirst({
    where: { id: input.bookingId, clientProfileId: input.clientProfileId },
    include: { changeOrders: true },
  });
  if (!booking) return { ok: false, error: "Booking not found.", status: 404 };

  const order = booking.changeOrders.find((c) => c.id === input.changeOrderId);
  if (!order) return { ok: false, error: "Change order not found.", status: 404 };
  if (order.status !== "proposed") {
    return { ok: false, error: "Change order already resolved.", status: 409 };
  }

  if (input.action === "reject") {
    const row = await prisma.bookingChangeOrder.update({
      where: { id: order.id },
      data: { status: "rejected", rejectedAt: new Date() },
    });
    return { ok: true, changeOrder: toChangeOrderDto(row) };
  }

  if (!ACTIVE_BOOKING_STATUSES.includes(booking.status)) {
    return { ok: false, error: "Booking is no longer active.", status: 400 };
  }

  // Re-validate against the cap at acceptance time.
  const original = originalAmountOf(booking.agreedAmount, booking.changeOrders);
  const check = validateChangeOrderAmount(original, booking.agreedAmount, order.proposedAmount);
  if (!check.ok) return { ok: false, error: check.error, status: 400 };

  const rate = order.commissionRate;
  const row = await prisma.$transaction(async (tx) => {
    const updated = await tx.bookingChangeOrder.update({
      where: { id: order.id },
      data: { status: "accepted", acceptedAt: new Date() },
    });
    await tx.booking.update({
      where: { id: booking.id },
      data: { agreedAmount: order.proposedAmount, commissionRate: rate },
    });

    // Ledger: if a payment line already exists, add the delta (internal provider, no Stripe).
    const payment = await tx.payment.findUnique({
      where: { bookingId: booking.id },
      include: { commission: true },
    });
    if (payment) {
      const gross = Math.round((payment.amountGross + order.deltaAmount) * 100) / 100;
      const { amount, amountNet } = calculateCommission(gross, rate);
      await tx.payment.update({
        where: { id: payment.id },
        data: { amountGross: gross, amountNet },
      });
      if (payment.commission) {
        await tx.commission.update({
          where: { id: payment.commission.id },
          data: { amount, rate },
        });
      }
    }
    return updated;
  });
  return { ok: true, changeOrder: toChangeOrderDto(row) };
}
