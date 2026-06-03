import { prisma } from "@/lib/db";
import type { AdminPaymentDto } from "@/types/admin";

export async function listPaymentsForAdmin(): Promise<AdminPaymentDto[]> {
  const payments = await prisma.payment.findMany({
    include: {
      booking: {
        include: { job: { select: { title: true } } },
      },
      commission: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return payments.map((p) => ({
    id: p.id,
    bookingId: p.bookingId,
    jobTitle: p.booking.job.title,
    amountGross: p.amountGross,
    amountNet: p.amountNet,
    currency: p.currency,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    commission: p.commission
      ? {
          id: p.commission.id,
          rate: p.commission.rate,
          amount: p.commission.amount,
          status: p.commission.status,
        }
      : null,
  }));
}
