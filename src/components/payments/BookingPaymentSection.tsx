"use client";

import { useCallback, useEffect, useState } from "react";
import { BookingChangeOrders } from "@/components/payments/BookingChangeOrders";
import {
  EstimatedPaymentBreakdown,
  PaymentBreakdown,
} from "@/components/payments/PaymentBreakdown";
import type { ChangeOrderSummaryDto } from "@/types/change-order";
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
  const [summary, setSummary] = useState<ChangeOrderSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);

  const apiBase =
    actor === "client" ? "/api/client/bookings" : "/api/pilot/bookings";
  const completed = bookingStatus === "completed";
  const cancelled = bookingStatus === "cancelled";

  const load = useCallback(async () => {
    const [paymentData, summaryData] = await Promise.all([
      completed
        ? fetch(`${apiBase}/${bookingId}/payment`).then((r) => r.json())
        : Promise.resolve({ payment: null }),
      fetch(`${apiBase}/${bookingId}/change-orders`).then((r) => r.json()),
    ]);
    setPayment(paymentData.payment ?? null);
    setSummary(summaryData.summary ?? null);
  }, [apiBase, bookingId, completed]);

  useEffect(() => {
    load()
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [load]);

  if (cancelled) return null;
  if (loading) {
    return <p className="ras-help">Loading payment details…</p>;
  }

  return (
    <div className="space-y-4">
      {payment ? (
        <PaymentBreakdown payment={payment} viewerRole={actor} />
      ) : summary ? (
        <EstimatedPaymentBreakdown
          jobAmount={summary.currentAmount}
          currency={summary.currency}
          commissionRate={summary.commissionRate}
          viewerRole={actor}
        />
      ) : completed ? (
        <p className="ras-panel ras-muted text-sm">
          Payment record will appear shortly after completion.
        </p>
      ) : null}
      {summary && !completed ? (
        <BookingChangeOrders
          bookingId={bookingId}
          bookingStatus={bookingStatus}
          actor={actor}
          summary={summary}
          onChanged={() => void load()}
        />
      ) : null}
    </div>
  );
}
