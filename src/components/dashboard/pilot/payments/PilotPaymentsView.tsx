"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DownloadIcon } from "@/components/dashboard/client/billing/ClientBillingIcons";
import {
  downloadPilotPaymentsCsv,
  formatPilotPaymentAmount,
  formatPilotPaymentDate,
  getPlatformFee,
  summarizePilotPayments,
} from "@/lib/pilot/pilot-payments-map";
import type { PaymentListItemDto } from "@/types/payment";

const PAYMENTS_API = "/api/pilot/payments" as const;
const BOOKINGS_BASE = "/dashboard/pilot/bookings" as const;
const JOBS_HREF = "/dashboard/pilot/jobs" as const;

type PilotPaymentsViewProps = {
  commissionRatePercent: number;
};

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

export function PilotPaymentsView({ commissionRatePercent }: PilotPaymentsViewProps) {
  const [payments, setPayments] = useState<PaymentListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(PAYMENTS_API)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to load payments.");
          setPayments([]);
        } else {
          setPayments(data.payments ?? []);
        }
      })
      .catch(() => {
        setError("Failed to load payments.");
        setPayments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => summarizePilotPayments(payments), [payments]);
  const currency = payments[0]?.currency ?? "USD";

  const summaryCards = [
    {
      label: "TOTAL PAYOUTS",
      value: formatPilotPaymentAmount(summary.totalPayouts, currency),
      sub: "After platform fee",
    },
    {
      label: "GROSS EARNINGS",
      value: formatPilotPaymentAmount(summary.grossEarnings, currency),
      sub: `Before ${commissionRatePercent}% fee`,
    },
    {
      label: "PLATFORM FEES",
      value: formatPilotPaymentAmount(summary.platformFees, currency),
      sub: `${commissionRatePercent}% commission`,
    },
    {
      label: "COMPLETED JOBS",
      value: pad2(summary.completedJobs),
      sub: "Paid bookings",
    },
  ];

  function handleExportCsv() {
    if (payments.length === 0) return;
    downloadPilotPaymentsCsv(payments);
  }

  return (
    <div className="pilot-payments-page">
      <header className="pilot-payments-header pilot-payments-bracket-card">
        <div className="pilot-payments-header-copy">
          <p className="pilot-payments-eyebrow">BUSINESS / EARNINGS</p>
          <h1 className="pilot-payments-title">Earnings</h1>
          <p className="pilot-payments-subtitle">
            Earnings from completed jobs ({commissionRatePercent}% platform fee deducted).
          </p>
        </div>
        <div className="pilot-payments-header-actions">
          <Link href={JOBS_HREF} className="pilot-payments-btn-outline">
            My jobs →
          </Link>
          <button
            type="button"
            className="pilot-payments-btn-gold"
            onClick={handleExportCsv}
            disabled={payments.length === 0 || loading}
          >
            <DownloadIcon />
            Export CSV
          </button>
        </div>
      </header>

      {error ? (
        <p className="pilot-payments-banner pilot-payments-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="pilot-payments-stats-grid" aria-label="Earnings summary">
        {summaryCards.map((card) => (
          <article key={card.label} className="pilot-payments-stat-card">
            <p className="pilot-payments-stat-label">{card.label}</p>
            <p className="pilot-payments-stat-value">{card.value}</p>
            <p className="pilot-payments-stat-sub">{card.sub}</p>
          </article>
        ))}
      </section>

      <section className="pilot-payments-panel" aria-label="Payment history">
        <div className="pilot-payments-panel-head">
          <div>
            <h2 className="pilot-payments-panel-title">Payment history</h2>
            <p className="pilot-payments-panel-subtitle">
              Completed job payouts with marketplace commission deducted.
            </p>
          </div>
          <span className="pilot-payments-filter">All payouts</span>
        </div>

        {loading ? (
          <p className="pilot-payments-loading">Loading payments…</p>
        ) : payments.length === 0 ? (
          <div className="pilot-payments-empty">
            <h3 className="pilot-payments-empty-title">No payments yet</h3>
            <p className="pilot-payments-empty-text">
              Completed job payouts will appear here once client payments are released.
            </p>
          </div>
        ) : (
          <>
            <div className="pilot-payments-table-wrap">
              <table className="pilot-payments-table">
                <thead>
                  <tr>
                    <th scope="col">Job</th>
                    <th scope="col">Client</th>
                    <th scope="col">Payout</th>
                    <th scope="col">Gross</th>
                    <th scope="col">Fee</th>
                    <th scope="col">Date</th>
                    <th scope="col">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <PilotPaymentTableRow key={payment.id} payment={payment} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pilot-payments-cards">
              {payments.map((payment) => (
                <PilotPaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function PilotPaymentTableRow({ payment }: { payment: PaymentListItemDto }) {
  const fee = getPlatformFee(payment);

  return (
    <tr>
      <td className="pilot-payments-cell-job">{payment.booking.job.title}</td>
      <td className="pilot-payments-cell-client">{payment.counterpartyLabel}</td>
      <td className="pilot-payments-cell-payout">
        {formatPilotPaymentAmount(payment.amountNet, payment.currency)}
      </td>
      <td className="pilot-payments-cell-gross">
        {formatPilotPaymentAmount(payment.amountGross, payment.currency)}
      </td>
      <td className="pilot-payments-cell-fee">
        {formatPilotPaymentAmount(fee, payment.currency)}
      </td>
      <td className="pilot-payments-cell-date">
        {formatPilotPaymentDate(payment.createdAt)}
      </td>
      <td className="pilot-payments-cell-action">
        <Link href={`${BOOKINGS_BASE}/${payment.bookingId}`} className="pilot-payments-link">
          View booking →
        </Link>
      </td>
    </tr>
  );
}

function PilotPaymentCard({ payment }: { payment: PaymentListItemDto }) {
  const fee = getPlatformFee(payment);

  return (
    <article className="pilot-payments-card">
      <h3 className="pilot-payments-card-job">{payment.booking.job.title}</h3>
      <dl className="pilot-payments-card-grid">
        <div>
          <dt>Client</dt>
          <dd>{payment.counterpartyLabel}</dd>
        </div>
        <div>
          <dt>Payout</dt>
          <dd className="pilot-payments-card-payout">
            {formatPilotPaymentAmount(payment.amountNet, payment.currency)}
          </dd>
        </div>
        <div>
          <dt>Gross</dt>
          <dd>{formatPilotPaymentAmount(payment.amountGross, payment.currency)}</dd>
        </div>
        <div>
          <dt>Fee</dt>
          <dd>{formatPilotPaymentAmount(fee, payment.currency)}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{formatPilotPaymentDate(payment.createdAt)}</dd>
        </div>
      </dl>
      <Link href={`${BOOKINGS_BASE}/${payment.bookingId}`} className="pilot-payments-link">
        View booking →
      </Link>
    </article>
  );
}
