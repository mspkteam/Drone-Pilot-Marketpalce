import {
  calculateCommission,
  DEFAULT_COMMISSION_RATE,
} from "@/lib/commission/constants";
import { prisma } from "@/lib/db";
import { formatMissionDisplayId } from "@/lib/admin/dispute-center-filters";
import type {
  AdminCommissionLedgerRowDto,
  AdminCommissionStatsDto,
  AdminCommissionsResponseDto,
  CommissionLedgerStatus,
} from "@/types/admin-commissions";

const FIXED_RATE_PERCENT = Math.round(DEFAULT_COMMISSION_RATE * 100);

export const MOCK_COMMISSION_LEDGER: AdminCommissionLedgerRowDto[] = [
  {
    id: "mock-1",
    missionId: "MIS-8821",
    missionTitle: "HelioGrid solar survey",
    pilotName: "Marcus Vaughan",
    clientName: "HelioGrid",
    amountGross: 4800,
    commissionAmount: 480,
    currency: "USD",
    ratePercent: FIXED_RATE_PERCENT,
    status: "SETTLED",
    createdAt: "2026-05-28T12:00:00.000Z",
  },
  {
    id: "mock-2",
    missionId: "MIS-8819",
    missionTitle: "Atlantic coastal mapping",
    pilotName: "Elara Vance",
    clientName: "Atlantic Survey",
    amountGross: 2150,
    commissionAmount: 215,
    currency: "USD",
    ratePercent: FIXED_RATE_PERCENT,
    status: "PENDING",
    createdAt: "2026-05-27T12:00:00.000Z",
  },
  {
    id: "mock-3",
    missionId: "MIS-8814",
    missionTitle: "Lumen aerial cinematography",
    pilotName: "Julian Reyes",
    clientName: "Lumen Films",
    amountGross: 1200,
    commissionAmount: 120,
    currency: "USD",
    ratePercent: FIXED_RATE_PERCENT,
    status: "SETTLED",
    createdAt: "2026-05-26T12:00:00.000Z",
  },
  {
    id: "mock-4",
    missionId: "MIS-8807",
    missionTitle: "Apex site inspection",
    pilotName: "Hana Okafor",
    clientName: "Apex Construction",
    amountGross: 8400,
    commissionAmount: 840,
    currency: "USD",
    ratePercent: FIXED_RATE_PERCENT,
    status: "HELD",
    createdAt: "2026-05-25T12:00:00.000Z",
  },
  {
    id: "mock-5",
    missionId: "MIS-8801",
    missionTitle: "Skyward pipeline patrol",
    pilotName: "Quinn Mendes",
    clientName: "Skyward Energy",
    amountGross: 6200,
    commissionAmount: 620,
    currency: "USD",
    ratePercent: FIXED_RATE_PERCENT,
    status: "SETTLED",
    createdAt: "2026-05-24T12:00:00.000Z",
  },
];

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

function fixedCommissionAmount(amountGross: number): number {
  return calculateCommission(amountGross, DEFAULT_COMMISSION_RATE).amount;
}

function growthSubtext(current: number, previous: number): string {
  if (previous <= 0) {
    return current > 0 ? "+100%" : "—";
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

export async function getAdminCommissionsData(): Promise<AdminCommissionsResponseDto> {
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
    return {
      ledger: MOCK_COMMISSION_LEDGER,
      stats: buildMockStats(),
      totalEntries: 124,
      usingMockLedger: true,
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
      commissionAmount: fixedCommissionAmount(payment.amountGross),
      currency: payment.currency,
      ratePercent: FIXED_RATE_PERCENT,
      status: mapLedgerStatus(payment.status, payment.commission?.status ?? null),
      createdAt: payment.createdAt.toISOString(),
    };
  });

  const stats = computeStatsFromLedger(ledger);
  return {
    ledger,
    stats,
    totalEntries: ledger.length,
    usingMockLedger: false,
  };
}

function buildMockStats(): AdminCommissionStatsDto {
  return {
    commissionMtd: 48210,
    commissionMtdSubtext: "+22%",
    commissionRatePercent: FIXED_RATE_PERCENT,
    commissionRateSubtext: "fixed platform rate",
    pendingPayouts: 12840,
    pendingPayoutsSubtext: "14 missions",
    settled30d: 162400,
    settled30dSubtext: "+9%",
    currency: "USD",
    usingMockGrowth: true,
  };
}

function computeStatsFromLedger(
  ledger: AdminCommissionLedgerRowDto[],
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
    commissionRatePercent: FIXED_RATE_PERCENT,
    commissionRateSubtext: "fixed platform rate",
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

