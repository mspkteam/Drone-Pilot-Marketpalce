"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";
import type { PaymentListItemDto } from "@/types/payment";

const PLATFORM_FEE_PERCENT = Math.round(DEFAULT_COMMISSION_RATE * 100);

type PaymentsListProps = {
  apiPath: "/api/client/payments" | "/api/pilot/payments";
  bookingsBase: "/dashboard/client/bookings" | "/dashboard/pilot/bookings";
  viewerRole: "client" | "pilot";
  emptyMessage: string;
};

export function PaymentsList({
  apiPath,
  bookingsBase,
  viewerRole,
  emptyMessage,
}: PaymentsListProps) {
  const [payments, setPayments] = useState<PaymentListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiPath)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPayments(data.payments ?? []);
        }
      })
      .catch(() => setError("Failed to load payments."))
      .finally(() => setLoading(false));
  }, [apiPath]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading payments…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="empty-state">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="list-panel">
      {payments.map((payment) => (
        <li key={payment.id} className="p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium">{payment.booking.job.title}</p>
              <p className="text-sm text-muted-foreground">
                {viewerRole === "client" ? "Pilot" : "Client"}:{" "}
                {payment.counterpartyLabel}
              </p>
              <p className="mt-2 text-sm">
                {viewerRole === "client" ? (
                  <>
                    Total {payment.currency}{" "}
                    {payment.amountGross.toLocaleString()}
                    {payment.commission ? (
                      <>
                        {" "}
                        · Fee {payment.currency}{" "}
                        {payment.commission.amount.toLocaleString()} (
                        {PLATFORM_FEE_PERCENT}%)
                      </>
                    ) : null}
                  </>
                ) : (
                  <>
                    Payout {payment.currency}{" "}
                    {payment.amountNet.toLocaleString()}
                    {payment.commission ? (
                      <>
                        {" "}
                        (gross {payment.currency}{" "}
                        {payment.amountGross.toLocaleString()}, fee{" "}
                        {payment.commission.amount.toLocaleString()})
                      </>
                    ) : null}
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(payment.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Link
              href={`${bookingsBase}/${payment.bookingId}`}
              className="text-sm text-gold-dark hover:text-gold shrink-0"
            >
              View booking →
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
