export const CHANGE_ORDER_STATUSES = [
  "proposed",
  "accepted",
  "rejected",
  "charged",
] as const;

export type ChangeOrderStatus = (typeof CHANGE_ORDER_STATUSES)[number];

export type ChangeOrderDto = {
  id: string;
  bookingId: string;
  proposedAmount: number;
  deltaAmount: number;
  serviceFee: number;
  currency: string;
  status: ChangeOrderStatus;
  note: string | null;
  proposedByUserId: string;
  commissionRate: number;
  provider: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  chargedAt: string | null;
  createdAt: string;
};

export type ChangeOrderSummaryDto = {
  originalAmount: number;
  currentAmount: number;
  maxAmount: number;
  commissionRate: number;
  currency: string;
  changeOrders: ChangeOrderDto[];
};
