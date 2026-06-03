export const PAYMENT_STATUSES = [
  "pending",
  "processing",
  "succeeded",
  "failed",
  "refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const COMMISSION_STATUSES = [
  "calculated",
  "invoiced",
  "collected",
  "waived",
] as const;

export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];

export type CommissionDto = {
  id: string;
  bookingId: string;
  paymentId: string | null;
  rate: number;
  amount: number;
  currency: string;
  status: CommissionStatus;
  calculatedAt: string;
};

export type PaymentDto = {
  id: string;
  bookingId: string;
  payerUserId: string;
  payeeUserId: string;
  amountGross: number;
  amountNet: number;
  currency: string;
  provider: string;
  status: PaymentStatus;
  createdAt: string;
  commission: CommissionDto | null;
};

export type PaymentListItemDto = PaymentDto & {
  booking: {
    id: string;
    job: { id: string; title: string };
  };
  counterpartyLabel: string;
};
