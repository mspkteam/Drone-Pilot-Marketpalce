export type CommissionLedgerStatus = "SETTLED" | "PENDING" | "HELD";

export type AdminCommissionLedgerRowDto = {
  id: string;
  missionId: string;
  missionTitle: string;
  pilotName: string;
  clientName: string;
  amountGross: number;
  commissionAmount: number;
  currency: string;
  ratePercent: 10;
  status: CommissionLedgerStatus;
  createdAt: string;
};

export type AdminCommissionStatsDto = {
  commissionMtd: number;
  commissionMtdSubtext: string;
  commissionRatePercent: 10;
  commissionRateSubtext: string;
  pendingPayouts: number;
  pendingPayoutsSubtext: string;
  settled30d: number;
  settled30dSubtext: string;
  currency: string;
  usingMockGrowth: boolean;
};

export type AdminCommissionsResponseDto = {
  ledger: AdminCommissionLedgerRowDto[];
  stats: AdminCommissionStatsDto;
  totalEntries: number;
  usingMockLedger: boolean;
};
