import {
  calculatePaymentBreakdown,
  DEFAULT_COMMISSION_RATE,
  type PaymentBreakdownAmounts,
} from "@/lib/commission/constants";
import type { PaymentDto } from "@/types/payment";

type Viewer = "client" | "pilot";

type PaymentBreakdownProps = {
  payment: PaymentDto;
  viewerRole: Viewer;
};

function BreakdownList({
  amounts,
  currency,
  viewerRole,
  status,
}: {
  amounts: PaymentBreakdownAmounts;
  currency: string;
  viewerRole: Viewer;
  status: string;
}) {
  const money = (n: number) => `${currency} ${n.toLocaleString()}`;
  const ratePercent = Math.round(amounts.commissionRate * 1000) / 10;
  const feePercent = Math.round(amounts.serviceFeeRate * 1000) / 10;

  return (
    <dl className="ras-dl ras-dl--2">
      <div>
        <dt>Job amount</dt>
        <dd>{money(amounts.jobAmount)}</dd>
      </div>
      {viewerRole === "client" ? (
        <>
          <div>
            <dt>Service fee ({feePercent}%)</dt>
            <dd>{money(amounts.serviceFee)}</dd>
          </div>
          <div>
            <dt>Total client pays</dt>
            <dd className="ras-accent">{money(amounts.totalClientPays)}</dd>
          </div>
        </>
      ) : (
        <>
          <div>
            <dt>Platform commission ({ratePercent}%)</dt>
            <dd>{money(amounts.rasCommission)}</dd>
          </div>
          <div>
            <dt>Your payout</dt>
            <dd className="ras-accent">{money(amounts.pilotNet)}</dd>
          </div>
        </>
      )}
      <div>
        <dt>Status</dt>
        <dd className="capitalize">{status}</dd>
      </div>
    </dl>
  );
}

export function PaymentBreakdown({ payment, viewerRole }: PaymentBreakdownProps) {
  // Ignore legacy grade-band rates (10–14%) so summaries match the admin ledger.
  // Keep intentional admin overrides outside that band (e.g. 7.5% or 20%).
  const storedRate =
    payment.commission?.rate != null && payment.commission.rate > 0
      ? payment.commission.rate
      : null;
  const looksLikeLegacyGradeFee =
    storedRate != null && storedRate >= 0.1 && storedRate < 0.145;
  const rate =
    storedRate != null && !looksLikeLegacyGradeFee
      ? storedRate
      : DEFAULT_COMMISSION_RATE;
  const amounts = calculatePaymentBreakdown(payment.amountGross, rate);

  return (
    <div className="ras-panel space-y-4">
      <h3 className="ras-panel-title">Payment summary</h3>
      <BreakdownList
        amounts={amounts}
        currency={payment.currency}
        viewerRole={viewerRole}
        status={payment.status}
      />
      <p className="ras-help">
        Estimated ledger amounts (held internally). Card payment via Stripe is
        planned for a later release.
      </p>
    </div>
  );
}

type EstimatedPaymentBreakdownProps = {
  jobAmount: number;
  currency: string;
  commissionRate: number;
  viewerRole: Viewer;
};

/** Pre-completion estimate — shown before any Payment record exists. */
export function EstimatedPaymentBreakdown({
  jobAmount,
  currency,
  commissionRate,
  viewerRole,
}: EstimatedPaymentBreakdownProps) {
  return (
    <div className="ras-panel space-y-4">
      <h3 className="ras-panel-title">Estimated payment</h3>
      <BreakdownList
        amounts={calculatePaymentBreakdown(jobAmount, commissionRate)}
        currency={currency}
        viewerRole={viewerRole}
        status="held (estimated)"
      />
      <p className="ras-help">
        Estimate only. Funds are not charged yet; escrow and card payment arrive
        with Stripe.
      </p>
    </div>
  );
}
