"use client";

import { useCallback, useEffect, useState } from "react";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import { Button } from "@/components/ui/Button";
import type { BookingListItemDto } from "@/types/booking";
import { BOOKING_STATUSES, type BookingStatus } from "@/types/booking";
import { cn } from "@/lib/utils";

const FILTERS: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  ...BOOKING_STATUSES.map((s) => ({
    value: s,
    label: s.replace("_", " "),
  })),
];

export function AdminBookingsPanel() {
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [bookings, setBookings] = useState<BookingListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings?status=${filter}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load bookings.");
        setBookings([]);
      } else {
        setBookings(data.bookings ?? []);
      }
    } catch {
      setError("Failed to load bookings.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(bookingId: string, status: BookingStatus) {
    setActingId(bookingId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Update failed.");
      } else {
        await load();
      }
    } catch {
      setError("Update failed.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "filter-pill capitalize",
              filter === f.value && "filter-pill-active",
            )}
          >
            {f.label}
          </button>
        ))}
        <Button type="button" variant="ghost" size="sm" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <p className="empty-state">
          No bookings in this queue.
        </p>
      ) : (
        <ul className="list-panel">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <p className="font-medium">{b.job.title}</p>
                <p className="text-sm text-muted-foreground">
                  {b.pilot.displayName} · {b.client.contactName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {b.currency} {b.agreedAmount.toLocaleString()} ·{" "}
                  {b.job.locationLabel}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <BookingStatusBadge status={b.status} />
                {b.status !== "completed" && b.status !== "cancelled" ? (
                  <div className="flex flex-wrap gap-2">
                    {b.status === "pending" ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={actingId === b.id}
                        onClick={() => void setStatus(b.id, "confirmed")}
                      >
                        Confirm
                      </Button>
                    ) : null}
                    {b.status === "confirmed" ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={actingId === b.id}
                        onClick={() => void setStatus(b.id, "in_progress")}
                      >
                        Start
                      </Button>
                    ) : null}
                    {b.status === "in_progress" ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={actingId === b.id}
                        onClick={() => void setStatus(b.id, "completed")}
                      >
                        Complete
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={actingId === b.id}
                      onClick={() => void setStatus(b.id, "cancelled")}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
