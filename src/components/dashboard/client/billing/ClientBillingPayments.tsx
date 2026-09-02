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

function mapPaymentToInvoice(
  payment: PaymentListItemDto,
  index: number,
): ClientBillingInvoice {
  return {
    id: payment.id,
    invoiceId: `INV-${1001 + index}`,
    projectLabel: payment.booking.job.title,
    dateLabel: formatInvoiceDate(payment.createdAt),
    amount: formatInvoiceAmount(payment.amountGross, payment.currency),
    paymentId: payment.id,
  };
}

export function ClientBillingPayments() {
  const [payments, setPayments] = useState<PaymentListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [loadPayments]);

  const invoices = useMemo(
    () => payments.map(mapPaymentToInvoice),
    [payments],
  );

  return (
    <div className="client-billing-page">
      <header className="client-billing-header">
        <h1 className="client-billing-title">Billing &amp; Payments</h1>
        <p className="client-billing-subtitle">
          Receipts from completed projects. Card methods will appear here when Stripe is connected.
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
        <p className="client-billing-list-status">
          No cards on file. Stripe payment methods ship in a later milestone — we do not store
          sample card numbers.
        </p>
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
            {invoices.map((invoice) => (
              <li key={invoice.id} className="client-billing-invoice-row">
                <div className="client-billing-invoice-copy">
                  <p className="client-billing-invoice-id">{invoice.invoiceId}</p>
                  <p className="client-billing-invoice-meta">
                    {invoice.projectLabel} · {invoice.dateLabel}
                  </p>
                </div>
                <div className="client-billing-invoice-actions">
                  <p className="client-billing-invoice-amount">{invoice.amount}</p>
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
