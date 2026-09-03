import type { BookingListItemDto, BookingStatus } from "@/types/booking";
import type { DeliveryStatus } from "@/types/delivery";
import {
  buildPilotContractActions,
  pilotContractPhaseLabel,
  resolvePilotContractPhase,
  type PilotContractPhase,
} from "@/lib/bookings/contract-actions";
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

function phaseToUiStatus(
  phase: PilotContractPhase,
  booking: BookingListItemDto,
): PilotContractUiStatus {
  switch (phase) {
    case "pending":
      return "Pending";
    case "ready":
      return "Ready to start";
    case "awaiting_review":
      return "Awaiting review";
    case "revisions_requested":
      return "Revisions requested";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "disputed":
      return "Disputed";
    case "in_progress":
    default:
      return isDueSoon(booking) ? "Due Soon" : "On Track";
  }
}

export function mapBookingStatusToContractUi(
  status: BookingStatus,
  booking: BookingListItemDto,
  deliveryStatus: DeliveryStatus | null = booking.deliveryStatus ?? null,
): PilotContractUiStatus {
  const phase = resolvePilotContractPhase(status, deliveryStatus);
  return phaseToUiStatus(phase, booking);
}

export function mapBookingToActiveContract(
  booking: BookingListItemDto,
): PilotActiveContract {
  const client =
    booking.client.companyName?.trim() ||
    booking.client.contactName ||
    "Client";

  const detailHref = PILOT_ACTIVE_CONTRACTS_ROUTES.bookingDetail(booking.id);
  const deliverHref = `${detailHref}#deliver`;
  const disputeHref = `${detailHref}#dispute`;
  const messageHref = booking.conversationId
    ? PILOT_ACTIVE_CONTRACTS_ROUTES.conversation(booking.conversationId)
    : PILOT_ACTIVE_CONTRACTS_ROUTES.messages;

  const phase = resolvePilotContractPhase(
    booking.status,
    booking.deliveryStatus ?? null,
  );

  return {
    id: booking.id,
    contractId: formatContractId(booking.id),
    title: booking.job.title,
    client,
    deadline: formatDeadline(booking),
    value: formatValue(booking.agreedAmount, booking.currency),
    status: phaseToUiStatus(phase, booking),
    detailHref,
    deliverHref,
    messageHref,
    disputeHref,
    actions: buildPilotContractActions({
      phase,
      detailHref,
      messageHref,
      deliverHref,
      disputeHref,
    }),
  };
}

export { pilotContractPhaseLabel };
