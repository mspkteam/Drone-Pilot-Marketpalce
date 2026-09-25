import Link from "next/link";
import { BookingStatusActions } from "@/components/bookings/BookingStatusActions";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import type { BookingActor } from "@/lib/bookings/status";
import { formatDisplayDateTime } from "@/lib/format/date";
import type { BookingListItemDto, BookingStatus } from "@/types/booking";

type BookingDetailCardProps = {
  booking: BookingListItemDto;
  actor: BookingActor;
  apiBase: "/api/client/bookings" | "/api/pilot/bookings";
};

export function BookingDetailCard({
  booking,
  actor,
  apiBase,
}: BookingDetailCardProps) {
  const counterparty =
    actor === "client" ? booking.pilot.displayName : booking.client.contactName;

  return (
    <div className="space-y-6">
      <div className="ras-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="ras-panel-heading">{booking.job.title}</h2>
          <BookingStatusBadge status={booking.status as BookingStatus} />
        </div>
        <p className="ras-help">{booking.job.locationLabel}</p>
        <dl className="ras-dl ras-dl--2 mt-6">
          <div>
            <dt>{actor === "client" ? "Pilot" : "Client"}</dt>
            <dd>{counterparty}</dd>
          </div>
          <div>
            <dt>Agreed amount</dt>
            <dd>
              {booking.currency} {booking.agreedAmount.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{formatDisplayDateTime(booking.createdAt)}</dd>
          </div>
          {booking.completedAt ? (
            <div>
              <dt>Completed</dt>
              <dd>{formatDisplayDateTime(booking.completedAt)}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="ras-panel">
        <h3 className="ras-panel-title">Actions</h3>
        <p className="ras-help">
          Confirm the booking, start work, or cancel. Completion happens after
          deliverable approval.
        </p>
        <div className="mt-4">
          <BookingStatusActions
            bookingId={booking.id}
            status={booking.status as BookingStatus}
            actor={actor}
            apiBase={apiBase}
          />
        </div>
        {actor === "client" ? (
          <p className="mt-4">
            <Link
              href={
                booking.conversationId
                  ? `/dashboard/client/messages?conversation=${booking.conversationId}`
                  : `/dashboard/client/messages?pilot=${booking.pilotProfileId}`
              }
              className="ras-link inline-flex items-center rounded-md border border-[rgba(216,179,57,0.35)] bg-[rgba(216,179,57,0.1)] px-3 py-2 text-sm"
            >
              Message pilot
            </Link>
          </p>
        ) : null}
      </div>

      {actor === "client" ? (
        <p className="text-sm">
          <Link
            href={`/dashboard/client/jobs/${booking.jobId}`}
            className="ras-link"
          >
            View related job →
          </Link>
        </p>
      ) : null}
    </div>
  );
}
