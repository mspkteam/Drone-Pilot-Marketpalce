import type { AdminCommissionLedgerRowDto } from "@/types/admin-commissions";
import { DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";

export function formatCommissionMoney(
  amount: number,
  currency: string,
): string {
  if (currency === "USD") {
    return `$${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function buildCommissionLedgerCsv(
  rows: AdminCommissionLedgerRowDto[],
): string {
  const header = "Mission,Pilot,Client,Gross,Rate,Commission,Status";
  const lines = rows.map((row) => {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    return [
      escape(row.missionId),
      escape(row.pilotName),
      escape(row.clientName),
      escape(formatCommissionMoney(row.amountGross, row.currency)),
      `${Math.round(DEFAULT_COMMISSION_RATE * 100)}%`,
      escape(formatCommissionMoney(row.commissionAmount, row.currency)),
      escape(row.status),
    ].join(",");
  });
  return [header, ...lines].join("\n");
}

export function downloadCommissionLedgerCsv(
  rows: AdminCommissionLedgerRowDto[],
): void {
  const csv = buildCommissionLedgerCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "pilot-commissions-ledger.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
