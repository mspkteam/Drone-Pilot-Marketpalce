"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CLIENT_BILLING_INVOICE_FALLBACK,
  CLIENT_DEFAULT_PAYMENT_METHOD,
  formatInvoiceAmount,
  formatInvoiceDate,
  type ClientBillingInvoice,
} from "@/lib/client/billing-mock";
import type { PaymentListItemDto } from "@/types/payment";
import { CardIcon, DownloadIcon, PlusIcon } from "./ClientBillingIcons";

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
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
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

  const invoices = useMemo(() => {
    if (payments.length > 0) {
      return payments.map(mapPaymentToInvoice);
    }
    return [...CLIENT_BILLING_INVOICE_FALLBACK];
  }, [payments]);

  const usingMockInvoices = payments.length === 0 && !loading;
  const paymentMethod = CLIENT_DEFAULT_PAYMENT_METHOD;

  function handlePendingAction(label: string) {
    setPendingAction(label);
    window.setTimeout(() => setPendingAction(null), 1800);
  }

  return (
    <div className="client-billing-page">
      <header className="client-billing-header">
        <h1 className="client-billing-title">Billing &amp; Payments</h1>
        <p className="client-billing-subtitle">
          Manage your payment methods and download past invoices.
        </p>
      </header>

      {error ? (
        <p className="client-billing-banner client-billing-banner--error" role="alert">
          {error}
          {usingMockInvoices
            ? " Showing sample invoices until payment history is available."
            : null}
        </p>
      ) : null}

      {pendingAction ? (
        <p className="client-billing-banner" role="status">
          {pendingAction} — Stripe payment method management pending (M65).
        </p>
      ) : null}

      <section className="client-billing-panel">
        <div className="client-billing-panel-head">
          <h2 className="client-billing-panel-title">Saved payment methods</h2>
          <button
            type="button"
            className="client-billing-btn-outline"
            onClick={() => handlePendingAction("Add payment method")}
          >
            <PlusIcon />
            Add method
          </button>
        </div>

        <div className="client-billing-method-card">
          <div className="client-billing-method-left">
            <span className="client-billing-card-icon" aria-hidden>
              <CardIcon />
            </span>
            <div>
              <p className="client-billing-method-title">
                {paymentMethod.brand} ending in {paymentMethod.last4}
              </p>
              <p className="client-billing-method-meta">
                Expires {paymentMethod.expires}
                {paymentMethod.isDefault ? " · Default" : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="client-billing-manage-btn"
            onClick={() => handlePendingAction("Manage payment method")}
          >
            Manage
          </button>
        </div>
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
                    onClick={() =>
                      handlePendingAction(`Download ${invoice.invoiceId} PDF`)
                    }
                  >
                    <DownloadIcon />
                    PDF
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {usingMockInvoices && !loading ? (
          <p className="client-billing-footnote">
            Sample invoice rows shown — wired to{" "}
            <code>/api/client/payments</code> when booking payments exist.
          </p>
        ) : null}
      </section>
    </div>
  );
}
