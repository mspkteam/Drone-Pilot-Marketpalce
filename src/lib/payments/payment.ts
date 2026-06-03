import type { Commission, Payment } from "@/generated/prisma/client";
import { calculateCommission, DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";
import { prisma } from "@/lib/db";
import type {
  CommissionDto,
  CommissionStatus,
  PaymentDto,
  PaymentListItemDto,
  PaymentStatus,
} from "@/types/payment";

export function toCommissionDto(commission: Commission): CommissionDto {
  return {
    id: commission.id,
    bookingId: commission.bookingId,
    paymentId: commission.paymentId,
    rate: commission.rate,
    amount: commission.amount,
    currency: commission.currency,
    status: commission.status as CommissionStatus,
    calculatedAt: commission.calculatedAt.toISOString(),
  };
}

export function toPaymentDto(
  payment: Payment & { commission?: Commission | null },
): PaymentDto {
  return {
    id: payment.id,
    bookingId: payment.bookingId,
    payerUserId: payment.payerUserId,
    payeeUserId: payment.payeeUserId,
    amountGross: payment.amountGross,
    amountNet: payment.amountNet,
    currency: payment.currency,
    provider: payment.provider,
    status: payment.status as PaymentStatus,
    createdAt: payment.createdAt.toISOString(),
    commission: payment.commission ? toCommissionDto(payment.commission) : null,
  };
}

const paymentListInclude = {
  commission: true,
  booking: {
    select: {
      id: true,
      job: { select: { id: true, title: true } },
      pilotProfile: { select: { displayName: true } },
      clientProfile: { select: { contactName: true, companyName: true } },
    },
  },
} as const;

function toListItem(
  payment: Payment & {
    commission: Commission | null;
    booking: {
      id: string;
      job: { id: string; title: string };
      pilotProfile: { displayName: string };
      clientProfile: { contactName: string; companyName: string | null };
    };
  },
  viewerRole: "client" | "pilot",
): PaymentListItemDto {
  const counterpartyLabel =
    viewerRole === "client"
      ? payment.booking.pilotProfile.displayName
      : (payment.booking.clientProfile.companyName ??
        payment.booking.clientProfile.contactName);

  return {
    ...toPaymentDto(payment),
    booking: {
      id: payment.booking.id,
      job: payment.booking.job,
    },
    counterpartyLabel,
  };
}

export async function recordPaymentForCompletedBooking(bookingId: string) {
  const existing = await prisma.payment.findUnique({
    where: { bookingId },
  });
  if (existing) return existing;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      clientProfile: { select: { userId: true } },
      pilotProfile: { select: { userId: true } },
    },
  });

  if (!booking || booking.status !== "completed") {
    return null;
  }

  const { amount, amountNet } = calculateCommission(
    booking.agreedAmount,
    DEFAULT_COMMISSION_RATE,
  );

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        bookingId: booking.id,
        payerUserId: booking.clientProfile.userId,
        payeeUserId: booking.pilotProfile.userId,
        amountGross: booking.agreedAmount,
        amountNet,
        currency: booking.currency,
        provider: "internal",
        status: "succeeded",
      },
    });

    await tx.commission.create({
      data: {
        bookingId: booking.id,
        paymentId: payment.id,
        rate: DEFAULT_COMMISSION_RATE,
        amount,
        currency: booking.currency,
        status: "calculated",
      },
    });

    return payment;
  });
}

export async function getPaymentForBooking(bookingId: string) {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
    include: { commission: true },
  });
  return payment ? toPaymentDto(payment) : null;
}

export async function listPaymentsForClientUser(userId: string) {
  const payments = await prisma.payment.findMany({
    where: { payerUserId: userId },
    include: paymentListInclude,
    orderBy: { createdAt: "desc" },
  });
  return payments.map((p) => toListItem(p, "client"));
}

export async function listPaymentsForPilotUser(userId: string) {
  const payments = await prisma.payment.findMany({
    where: { payeeUserId: userId },
    include: paymentListInclude,
    orderBy: { createdAt: "desc" },
  });
  return payments.map((p) => toListItem(p, "pilot"));
}
