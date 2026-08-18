import type { BookingListItemDto, BookingStatus } from "@/types/booking";
import {
  PILOT_ACTIVE_CONTRACTS_ROUTES,
  type PilotActiveContract,
  type PilotContractUiStatus,
} from "@/lib/pilot/active-contracts-types";

const DUE_SOON_DAYS = 5;

export function formatContractId(bookingId: string): string {
  const suffix = bookingId.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase();
  return `C-${suffix || "0000"}`;
}

function formatValue(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function daysUntil(iso: string): number {
  const end = new Date(iso).getTime();
  const now = Date.now();
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

function formatDeadline(booking: BookingListItemDto): string {
  if (booking.scheduledEndAt) {
    const days = daysUntil(booking.scheduledEndAt);
    if (days <= 0) return "Due today";
    return `${days}d`;
  }
  if (booking.scheduledStartAt) {
    const days = daysUntil(booking.scheduledStartAt);
    if (days > 0) return `${days}d`;
  }
  return "—";
}

function isDueSoon(booking: BookingListItemDto): boolean {
  const target = booking.scheduledEndAt ?? booking.scheduledStartAt;
  if (!target) return false;
  const days = daysUntil(target);
  return days >= 0 && days <= DUE_SOON_DAYS;
}

export function mapBookingStatusToContractUi(
  status: BookingStatus,
  booking: BookingListItemDto,
): PilotContractUiStatus {
  switch (status) {
    case "disputed":
      return "Disputed";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Completed";
    case "pending":
    case "confirmed":
    case "in_progress":
    default:
      return isDueSoon(booking) ? "Due Soon" : "On Track";
  }
}

export function mapBookingToActiveContract(
  booking: BookingListItemDto,
): PilotActiveContract {
  const client =
    booking.client.companyName?.trim() ||
    booking.client.contactName ||
    "Client";

  const detailHref = PILOT_ACTIVE_CONTRACTS_ROUTES.bookingDetail(booking.id);

  return {
    id: booking.id,
    contractId: formatContractId(booking.id),
    title: booking.job.title,
    client,
    deadline: formatDeadline(booking),
    value: formatValue(booking.agreedAmount, booking.currency),
    status: mapBookingStatusToContractUi(booking.status, booking),
    deliverHref: detailHref,
    messageHref: booking.conversationId
      ? PILOT_ACTIVE_CONTRACTS_ROUTES.conversation(booking.conversationId)
      : PILOT_ACTIVE_CONTRACTS_ROUTES.messages,
    disputeHref: `${detailHref}#dispute`,
  };
}
