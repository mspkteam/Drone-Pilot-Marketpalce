/** UI fallback for billing — replace with Stripe customer data in M65. */

export type ClientSavedPaymentMethod = {
  brand: string;
  last4: string;
  expires: string;
  isDefault: boolean;
};

export type ClientBillingInvoice = {
  id: string;
  invoiceId: string;
  projectLabel: string;
  dateLabel: string;
  amount: string;
  paymentId?: string;
};

export const CLIENT_DEFAULT_PAYMENT_METHOD: ClientSavedPaymentMethod = {
  brand: "Visa",
  last4: "4242",
  expires: "09/28",
  isDefault: true,
};

export const CLIENT_BILLING_INVOICE_FALLBACK: readonly ClientBillingInvoice[] = [
  {
    id: "inv-1001",
    invoiceId: "INV-1001",
    projectLabel: "Commercial Property Survey",
    dateLabel: "May 28, 2026",
    amount: "$1,320.00",
  },
  {
    id: "inv-1002",
    invoiceId: "INV-1002",
    projectLabel: "Roof Inspection — Plano",
    dateLabel: "May 14, 2026",
    amount: "$715.00",
  },
  {
    id: "inv-1003",
    invoiceId: "INV-1003",
    projectLabel: "Solar Farm Thermal Scan",
    dateLabel: "April 30, 2026",
    amount: "$2,420.00",
  },
] as const;

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
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
