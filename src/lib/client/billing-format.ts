import { formatDisplayDate } from "@/lib/format/date";

export type ClientBillingInvoice = {
  id: string;
  invoiceId: string;
  projectLabel: string;
  dateLabel: string;
  amount: string;
  paymentId?: string;
};

export function formatInvoiceAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatInvoiceDate(iso: string): string {
  return formatDisplayDate(iso);
}
