import Link from "next/link";
import { BookingStatusActions } from "@/components/bookings/BookingStatusActions";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import type { BookingActor } from "@/lib/bookings/status";
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
      <div className="rounded-lg border border-border bg-surface-elevated p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{booking.job.title}</h2>
          <BookingStatusBadge status={booking.status as BookingStatus} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {booking.job.locationLabel}
        </p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {actor === "client" ? "Pilot" : "Client"}
            </dt>
            <dd className="mt-1 text-sm font-medium">{counterparty}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Agreed amount
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {booking.currency} {booking.agreedAmount.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Created
            </dt>
            <dd className="mt-1 text-sm">
              {new Date(booking.createdAt).toLocaleString()}
            </dd>
          </div>
          {booking.completedAt ? (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Completed
              </dt>
              <dd className="mt-1 text-sm">
                {new Date(booking.completedAt).toLocaleString()}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="rounded-lg border border-border p-6">
        <h3 className="font-medium">Actions</h3>
        <p className="mt-1 text-sm text-muted-foreground">
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
      </div>

      {actor === "client" ? (
        <p className="text-sm text-muted-foreground">
          <Link
            href={`/dashboard/client/jobs/${booking.jobId}`}
            className="text-gold-dark hover:text-gold"
          >
            View related job →
          </Link>
        </p>
      ) : null}
    </div>
  );
}
