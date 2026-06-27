import { calculateCommission } from "@/lib/commission/constants";
import { getEffectiveCommissionRate } from "@/lib/admin/platform-settings";
import { prisma } from "@/lib/db";
import { formatMissionDisplayId } from "@/lib/admin/dispute-center-filters";
import type {
  AdminCommissionLedgerRowDto,
  AdminCommissionStatsDto,
  AdminCommissionsResponseDto,
  CommissionLedgerStatus,
} from "@/types/admin-commissions";

function mapLedgerStatus(
  paymentStatus: string,
  commissionStatus: string | null,
): CommissionLedgerStatus {
  if (commissionStatus === "collected") return "SETTLED";
  if (
    commissionStatus === "waived" ||
    paymentStatus === "refunded" ||
    paymentStatus === "failed"
  ) {
    return "HELD";
  }
  return "PENDING";
}

function commissionAmount(amountGross: number, rate: number): number {
  return calculateCommission(amountGross, rate).amount;
}

function growthSubtext(current: number, previous: number): string {
  if (previous <= 0) {
    return current > 0 ? "+100%" : "—";
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

export async function getAdminCommissionsData(): Promise<AdminCommissionsResponseDto> {
  const commissionRate = await getEffectiveCommissionRate();
  const ratePercent = Math.round(commissionRate * 100);

  const payments = await prisma.payment.findMany({
    include: {
      commission: true,
      booking: {
        include: {
          job: { select: { id: true, title: true } },
          pilotProfile: { select: { displayName: true } },
          clientProfile: { select: { contactName: true, companyName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (payments.length === 0) {
    const emptyLedger: AdminCommissionLedgerRowDto[] = [];
    return {
      ledger: emptyLedger,
      stats: computeStatsFromLedger(emptyLedger, ratePercent),
      totalEntries: 0,
      usingMockLedger: false,
    };
  }

  const ledger: AdminCommissionLedgerRowDto[] = payments.map((payment) => {
    const clientName =
      payment.booking.clientProfile.companyName ??
      payment.booking.clientProfile.contactName;

    return {
      id: payment.id,
      missionId: formatMissionDisplayId(payment.booking.job.id),
      missionTitle: payment.booking.job.title,
      pilotName: payment.booking.pilotProfile.displayName,
      clientName,
      amountGross: payment.amountGross,
      commissionAmount: commissionAmount(payment.amountGross, commissionRate),
      currency: payment.currency,
      ratePercent,
      status: mapLedgerStatus(payment.status, payment.commission?.status ?? null),
      createdAt: payment.createdAt.toISOString(),
    };
  });

  const stats = computeStatsFromLedger(ledger, ratePercent);
  return {
    ledger,
    stats,
    totalEntries: ledger.length,
    usingMockLedger: false,
  };
}

function computeStatsFromLedger(
  ledger: AdminCommissionLedgerRowDto[],
  ratePercent: number,
): AdminCommissionStatsDto {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const currency = ledger[0]?.currency ?? "USD";

  const commissionMtd = ledger
    .filter((row) => new Date(row.createdAt) >= monthStart)
    .reduce((sum, row) => sum + row.commissionAmount, 0);

  const commissionPrevMtd = ledger
    .filter((row) => {
      const date = new Date(row.createdAt);
      return date >= prevMonthStart && date < monthStart;
    })
    .reduce((sum, row) => sum + row.commissionAmount, 0);

  const pendingRows = ledger.filter((row) => row.status === "PENDING");
  const pendingPayouts = pendingRows.reduce(
    (sum, row) => sum + row.commissionAmount,
    0,
  );

  const settled30d = ledger
    .filter(
      (row) =>
        row.status === "SETTLED" && new Date(row.createdAt) >= thirtyDaysAgo,
    )
    .reduce((sum, row) => sum + row.commissionAmount, 0);

  const settledPrev30d = ledger
    .filter((row) => {
      const date = new Date(row.createdAt);
      return (
        row.status === "SETTLED" &&
        date >= sixtyDaysAgo &&
        date < thirtyDaysAgo
      );
    })
    .reduce((sum, row) => sum + row.commissionAmount, 0);

  return {
    commissionMtd,
    commissionMtdSubtext: growthSubtext(commissionMtd, commissionPrevMtd),
    commissionRatePercent: ratePercent,
    commissionRateSubtext: "from platform configuration",
    pendingPayouts,
    pendingPayoutsSubtext: `${pendingRows.length} mission${
      pendingRows.length === 1 ? "" : "s"
    }`,
    settled30d,
    settled30dSubtext: growthSubtext(settled30d, settledPrev30d),
    currency,
    usingMockGrowth: ledger.length < 2,
  };
}

