"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatInvoiceAmount,
  formatInvoiceDate,
  type ClientBillingInvoice,
} from "@/lib/client/billing-format";
import type { PaymentListItemDto } from "@/types/payment";
import { DownloadIcon } from "./ClientBillingIcons";

const PAYMENTS_API = "/api/client/payments" as const;
const METHODS_API = "/api/client/billing/payment-methods" as const;

type SavedCard = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

function mapPaymentToInvoice(
  payment: PaymentListItemDto,
  index: number,
): ClientBillingInvoice {
  return {
    id: payment.id,
    invoiceId: `INV-${1001 + index}`,
    projectLabel: payment.booking.job.title,
    dateLabel: formatInvoiceDate(payment.createdAt),
    amount: formatInvoiceAmount(payment.amountGross + (payment.serviceFeeAmount ?? 0), payment.currency),
    paymentId: payment.id,
  };
}

export function ClientBillingPayments() {
  const [payments, setPayments] = useState<PaymentListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stripeReady, setStripeReady] = useState(false);
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const loadMethods = useCallback(() => {
    fetch(METHODS_API)
      .then((res) => res.json())
      .then((data) => {
        setStripeReady(Boolean(data.configured));
        setCards(data.methods ?? []);
      })
      .catch(() => setStripeReady(false));
  }, []);

  async function addCard() {
    setBusy("add");
    setError(null);
    try {
      const res = await fetch(METHODS_API, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error ?? "Could not start card setup.");
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Could not start card setup.");
    } finally {
      setBusy(null);
    }
  }

  async function removeCard(id: string) {
    setBusy(id);
    try {
      await fetch(`${METHODS_API}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      loadMethods();
    } finally {
      setBusy(null);
    }
  }

  async function payBooking(bookingId: string) {
    setBusy(bookingId);
    setError(null);
    try {
      const res = await fetch(`/api/client/bookings/${bookingId}/payment`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error ?? "Could not start payment.");
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Could not start payment.");
    } finally {
      setBusy(null);
    }
  }

  const loadPayments = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(PAYMENTS_API)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setPayments([]);
        } else {
          setPayments(data.payments ?? []);
        }
      })
      .catch(() => {
        setError("Failed to load payment history.");
        setPayments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadPayments();
    loadMethods();
  }, [loadPayments, loadMethods]);

  const invoices = useMemo(
    () => payments.map(mapPaymentToInvoice),
    [payments],
  );

  return (
    <div className="client-billing-page">
      <header className="client-billing-header">
        <h1 className="client-billing-title">Billing &amp; Payments</h1>
        <p className="client-billing-subtitle">
          Receipts from completed projects. Live card methods, Stripe test mode, and
          downloadable invoice PDFs are waiting on client confirmation.
        </p>
      </header>

      {error ? (
        <div className="client-billing-banner client-billing-banner--error" role="alert">
          <p>{error}</p>
          <button type="button" className="client-billing-btn-outline" onClick={loadPayments}>
            Retry
          </button>
        </div>
      ) : null}

      <section className="client-billing-panel">
        <div className="client-billing-panel-head">
          <h2 className="client-billing-panel-title">Saved payment methods</h2>
        </div>
        {!stripeReady ? (
          <p className="client-billing-list-status">
            Card payments are not enabled in this environment.
          </p>
        ) : (
          <>
            {cards.length === 0 ? (
              <p className="client-billing-list-status">No cards on file.</p>
            ) : (
              <ul className="client-billing-invoice-list">
                {cards.map((card) => (
                  <li key={card.id} className="client-billing-invoice-row">
                    <div className="client-billing-invoice-copy">
                      <p className="client-billing-invoice-id">
                        {card.brand.toUpperCase()} •••• {card.last4}
                      </p>
                      <p className="client-billing-invoice-meta">
                        Expires {String(card.expMonth).padStart(2, "0")}/{card.expYear}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="client-billing-btn-outline"
                      disabled={busy === card.id}
                      onClick={() => void removeCard(card.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="client-billing-btn-outline"
              disabled={busy === "add"}
              onClick={() => void addCard()}
            >
              {busy === "add" ? "Opening Stripe…" : "Add card"}
            </button>
          </>
        )}
      </section>

      <section className="client-billing-panel">
        <div className="client-billing-invoices-head">
          <h2 className="client-billing-panel-title">Invoices</h2>
          <p className="client-billing-panel-subtitle">
            Receipts for every completed project.
          </p>
        </div>

        {loading ? (
          <p className="client-billing-list-status">Loading invoices…</p>
        ) : invoices.length === 0 ? (
          <p className="client-billing-list-status">
            No invoices yet. They appear after a booking is completed.
          </p>
        ) : (
          <ul className="client-billing-invoice-list">
            {invoices.map((invoice, index) => (
              <li key={invoice.id} className="client-billing-invoice-row">
                <div className="client-billing-invoice-copy">
                  <p className="client-billing-invoice-id">{invoice.invoiceId}</p>
                  <p className="client-billing-invoice-meta">
                    {invoice.projectLabel} · {invoice.dateLabel}
                  </p>
                </div>
                <div className="client-billing-invoice-actions">
                  <p className="client-billing-invoice-amount">{invoice.amount}</p>
                  {payments[index]?.provider === "stripe" &&
                  ["pending", "failed"].includes(payments[index].status) ? (
                    <button
                      type="button"
                      className="client-billing-btn-outline"
                      disabled={busy === payments[index].bookingId}
                      onClick={() => void payBooking(payments[index].bookingId)}
                    >
                      Pay now
                    </button>
                  ) : payments[index]?.provider === "stripe" ? (
                    <span className="client-billing-invoice-meta">
                      {payments[index].status === "held" ||
                      payments[index].status === "held_dispute"
                        ? "In escrow"
                        : payments[index].status}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    className="client-billing-btn-outline client-billing-pdf-btn"
                    disabled
                    title="PDF receipts ship with Stripe invoicing"
                  >
                    <DownloadIcon />
                    PDF
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
