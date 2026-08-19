import Link from "next/link";
import { BookingDeliverySection } from "@/components/bookings/BookingDeliverySection";
import { BookingStatusActions } from "@/components/bookings/BookingStatusActions";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import { BookingDisputeSection } from "@/components/disputes/BookingDisputeSection";
import { BookingPaymentSection } from "@/components/payments/BookingPaymentSection";
import { BookingReviewSection } from "@/components/reviews/BookingReviewSection";
import { formatContractId } from "@/lib/pilot/active-contracts-map";
import type { BookingListItemDto } from "@/types/booking";

type PilotBookingDetailViewProps = {
  booking: BookingListItemDto;
};

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMoney(amount: number, currency: string): string {
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

export function PilotBookingDetailView({ booking }: PilotBookingDetailViewProps) {
  const clientName =
    booking.client.companyName?.trim() || booking.client.contactName || "Client";
  const contractId = formatContractId(booking.id);
  const value = formatMoney(booking.agreedAmount, booking.currency);
  const messageHref = booking.conversationId
    ? `/dashboard/pilot/messages/${booking.conversationId}`
    : "/dashboard/pilot/messages";

  return (
    <div className="pilot-booking-page">
      <header className="pilot-booking-header pilot-booking-bracket">
        <Link href="/dashboard/pilot/contracts" className="pilot-booking-back">
          ← Back to Active Contracts
        </Link>
        <p className="pilot-booking-eyebrow">OPERATIONS / CONTRACTS</p>
        <div className="pilot-booking-title-row">
          <h1 className="pilot-booking-title">{booking.job.title}</h1>
          <BookingStatusBadge status={booking.status} />
        </div>
        <p className="pilot-booking-meta">
          {contractId}
          <span aria-hidden> · </span>
          {clientName}
          <span aria-hidden> · </span>
          {booking.job.locationLabel}
          <span aria-hidden> · </span>
          <span className="pilot-booking-value">{value}</span>
        </p>
      </header>

      <div className="pilot-booking-actions-bar">
        <a href="#deliver" className="pilot-booking-btn-gold">
          Deliver work
        </a>
        <Link href={messageHref} className="pilot-booking-btn-outline">
          Message client
        </Link>
        <a href="#dispute" className="pilot-booking-btn-danger">
          Open dispute
        </a>
      </div>

      <div className="pilot-booking-grid">
        <section className="pilot-booking-card">
          <h2 className="pilot-booking-card-title">Contract</h2>
          <dl className="pilot-booking-fields">
            <div>
              <dt>Client</dt>
              <dd>{clientName}</dd>
            </div>
            <div>
              <dt>Value</dt>
              <dd className="pilot-booking-value">{value}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{formatWhen(booking.createdAt)}</dd>
            </div>
            <div>
              <dt>Completed</dt>
              <dd>{formatWhen(booking.completedAt)}</dd>
            </div>
            <div>
              <dt>Scheduled start</dt>
              <dd>{formatWhen(booking.scheduledStartAt)}</dd>
            </div>
            <div>
              <dt>Scheduled end</dt>
              <dd>{formatWhen(booking.scheduledEndAt)}</dd>
            </div>
          </dl>
        </section>

        <section className="pilot-booking-card">
          <h2 className="pilot-booking-card-title">Status actions</h2>
          <p className="pilot-booking-help">
            Confirm the booking, start work, or cancel. Completion happens after
            deliverable approval.
          </p>
          <BookingStatusActions
            bookingId={booking.id}
            status={booking.status}
            actor="pilot"
            apiBase="/api/pilot/bookings"
          />
        </section>
      </div>

      <div className="pilot-booking-theme">
        <BookingDeliverySection
          bookingId={booking.id}
          bookingStatus={booking.status}
          actor="pilot"
        />
        <BookingPaymentSection
          bookingId={booking.id}
          bookingStatus={booking.status}
          actor="pilot"
        />
        <div id="dispute">
          <BookingDisputeSection
            bookingId={booking.id}
            bookingStatus={booking.status}
            actor="pilot"
          />
        </div>
        <BookingReviewSection bookingId={booking.id} actor="pilot" />
      </div>
    </div>
  );
}
