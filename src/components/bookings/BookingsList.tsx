"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import type { BookingListItemDto, BookingStatus } from "@/types/booking";

type BookingsListProps = {
  apiPath: "/api/client/bookings" | "/api/pilot/bookings";
  detailBase: "/dashboard/client/bookings" | "/dashboard/pilot/bookings";
  emptyMessage: string;
};

export function BookingsList({
  apiPath,
  detailBase,
  emptyMessage,
}: BookingsListProps) {
  const [bookings, setBookings] = useState<BookingListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiPath)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setBookings(data.bookings ?? []);
        }
      })
      .catch(() => setError("Failed to load bookings."))
      .finally(() => setLoading(false));
  }, [apiPath]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading bookings…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="empty-state">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="list-panel">
      {bookings.map((booking) => (
        <li key={booking.id}>
          <Link
            href={`${detailBase}/${booking.id}`}
            className="list-panel-row"
          >
            <div>
              <p className="font-medium">{booking.job.title}</p>
              <p className="text-sm text-muted-foreground">
                {booking.job.locationLabel} · {booking.currency}{" "}
                {booking.agreedAmount.toLocaleString()}
              </p>
            </div>
            <BookingStatusBadge status={booking.status as BookingStatus} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
