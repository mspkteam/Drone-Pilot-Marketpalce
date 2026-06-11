import type { PaymentListItemDto } from "@/types/payment";

export type PilotPaymentsSummary = {
  totalPayouts: number;
  grossEarnings: number;
  platformFees: number;
  completedJobs: number;
};

export function getPlatformFee(payment: PaymentListItemDto): number {
  if (payment.commission) {
    return payment.commission.amount;
  }
  return Math.round((payment.amountGross - payment.amountNet) * 100) / 100;
}

export function formatPilotPaymentAmount(
  amount: number,
  currency: string,
  options?: { decimals?: number },
): string {
  const decimals = options?.decimals ?? 2;
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatPilotPaymentDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US");
}

export function summarizePilotPayments(
  payments: PaymentListItemDto[],
): PilotPaymentsSummary {
  return payments.reduce(
    (acc, payment) => ({
      totalPayouts: acc.totalPayouts + payment.amountNet,
      grossEarnings: acc.grossEarnings + payment.amountGross,
      platformFees: acc.platformFees + getPlatformFee(payment),
      completedJobs: acc.completedJobs + 1,
    }),
    {
      totalPayouts: 0,
      grossEarnings: 0,
      platformFees: 0,
      completedJobs: 0,
    },
  );
}

function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildPilotPaymentsCsv(payments: PaymentListItemDto[]): string {
  const header = "Job,Client,Payout,Gross,Platform Fee,Date";
  const rows = payments.map((payment) => {
    const fee = getPlatformFee(payment);
    return [
      escapeCsvValue(payment.booking.job.title),
      escapeCsvValue(payment.counterpartyLabel),
      formatPilotPaymentAmount(payment.amountNet, payment.currency),
      formatPilotPaymentAmount(payment.amountGross, payment.currency),
      formatPilotPaymentAmount(fee, payment.currency),
      escapeCsvValue(formatPilotPaymentDate(payment.createdAt)),
    ].join(",");
  });
  return [header, ...rows].join("\n");
}

export function downloadPilotPaymentsCsv(payments: PaymentListItemDto[]): void {
  const csv = buildPilotPaymentsCsv(payments);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "pilot-payments.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
