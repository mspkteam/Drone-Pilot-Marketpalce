"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { getAvailableBookingActions } from "@/lib/bookings/status";
import type { BookingActor } from "@/lib/bookings/status";
import type { BookingStatus } from "@/types/booking";

type BookingStatusActionsProps = {
  bookingId: string;
  status: BookingStatus;
  actor: BookingActor;
  apiBase: "/api/client/bookings" | "/api/pilot/bookings";
};

export function BookingStatusActions({
  bookingId,
  status,
  actor,
  apiBase,
}: BookingStatusActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const actions = getAvailableBookingActions(actor, status);

  if (actions.length === 0) {
    return null;
  }

  async function handleAction(nextStatus: BookingStatus) {
    setError(null);
    setLoading(nextStatus);
    try {
      const res = await fetch(`${apiBase}/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update booking.");
        return;
      }
      router.refresh();
    } catch {
      setError("Failed to update booking.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {actions.map(({ action, label }) => (
          <Button
            key={action}
            type="button"
            size="sm"
            variant={action === "cancelled" ? "outline" : "primary"}
            disabled={loading !== null}
            onClick={() => handleAction(action)}
          >
            {loading === action ? "Updating…" : label}
          </Button>
        ))}
      </div>
    </div>
  );
}
