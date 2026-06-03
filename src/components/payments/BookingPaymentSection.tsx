"use client";

import { useEffect, useState } from "react";
import { PaymentBreakdown } from "@/components/payments/PaymentBreakdown";
import type { PaymentDto } from "@/types/payment";

type BookingPaymentSectionProps = {
  bookingId: string;
  bookingStatus: string;
  actor: "client" | "pilot";
};

export function BookingPaymentSection({
  bookingId,
  bookingStatus,
  actor,
}: BookingPaymentSectionProps) {
  const [payment, setPayment] = useState<PaymentDto | null>(null);
  const [loading, setLoading] = useState(bookingStatus === "completed");

  const apiBase =
    actor === "client" ? "/api/client/bookings" : "/api/pilot/bookings";

  useEffect(() => {
    if (bookingStatus !== "completed") {
      setLoading(false);
      return;
    }

    fetch(`${apiBase}/${bookingId}/payment`)
      .then((res) => res.json())
      .then((data) => setPayment(data.payment ?? null))
      .finally(() => setLoading(false));
  }, [bookingId, bookingStatus, apiBase]);

  if (bookingStatus !== "completed") {
    return null;
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading payment details…</p>
    );
  }

  if (!payment) {
    return (
      <p className="rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground">
        Payment record will appear shortly after completion.
      </p>
    );
  }

  return <PaymentBreakdown payment={payment} viewerRole={actor} />;
}
