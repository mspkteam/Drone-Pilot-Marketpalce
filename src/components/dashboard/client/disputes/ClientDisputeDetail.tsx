"use client";

import Link from "next/link";
import { BookingDisputeSection } from "@/components/disputes/BookingDisputeSection";
import { DisputeStatusBadge } from "@/components/disputes/DisputeStatusBadge";
import { getDisputeResolutionLabel } from "@/lib/disputes/status";
import type { BookingStatus } from "@/types/booking";
import type { DisputeDetailDto } from "@/types/dispute";

type ClientDisputeDetailProps = {
  dispute: DisputeDetailDto;
};

function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function formatDisputeDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ClientDisputeDetail({ dispute }: ClientDisputeDetailProps) {
  const bookingStatus = dispute.booking.status as BookingStatus;

  return (
    <div className="client-disputes-page">
      <header className="client-disputes-header">
        <Link href="/dashboard/client/disputes" className="client-disputes-back">
          ← All disputes
        </Link>
        <div className="client-disputes-detail-head">
          <h1 className="client-disputes-title">{dispute.booking.job.title}</h1>
          <DisputeStatusBadge status={dispute.status} />
        </div>
        <p className="client-disputes-subtitle">
          Review evidence, follow moderator updates, and track the resolution for
          this booking.
        </p>
      </header>

      <div className="client-disputes-summary-bar" role="status">
        <span>
          Pilot: <strong>{dispute.booking.pilot.displayName}</strong>
          {" · "}
          {formatAmount(dispute.booking.agreedAmount, dispute.booking.currency)}
          {" · "}
          Opened {formatDisputeDate(dispute.createdAt)}
          {" · "}
          {dispute.entryCount} {dispute.entryCount === 1 ? "entry" : "entries"}
        </span>
      </div>

      <section className="client-disputes-panel client-disputes-summary">
        <h2 className="client-disputes-panel-title">Summary</h2>
        <p className="client-disputes-summary-reason">{dispute.reason}</p>
        <dl className="client-disputes-summary-grid">
          <div>
            <dt>Opened by</dt>
            <dd>{dispute.openedByRole === "client" ? "You" : "Pilot"}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <DisputeStatusBadge status={dispute.status} />
            </dd>
          </div>
          <div>
            <dt>Booking</dt>
            <dd>
              <Link
                href={`/dashboard/client/bookings/${dispute.bookingId}`}
                className="client-disputes-link"
              >
                View booking
              </Link>
            </dd>
          </div>
          {dispute.resolutionType ? (
            <div>
              <dt>Resolution</dt>
              <dd>{getDisputeResolutionLabel(dispute.resolutionType)}</dd>
            </div>
          ) : null}
        </dl>
        {dispute.resolutionNotes ? (
          <div className="client-disputes-resolution">
            <strong>Moderator notes</strong>
            {dispute.resolutionNotes}
          </div>
        ) : null}
      </section>

      <section className="client-disputes-panel client-disputes-thread">
        <h2 className="client-disputes-panel-title">Dispute thread</h2>
        <BookingDisputeSection
          bookingId={dispute.bookingId}
          bookingStatus={bookingStatus}
          actor="client"
          embedded
        />
      </section>
    </div>
  );
}
