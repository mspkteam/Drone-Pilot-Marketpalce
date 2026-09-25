import {
  calculateCommission,
  DEFAULT_COMMISSION_RATE,
} from "@/lib/commission/constants";
import type { PaymentDto } from "@/types/payment";

type PaymentBreakdownProps = {
  payment: PaymentDto;
  viewerRole: "client" | "pilot";
};

export function PaymentBreakdown({ payment, viewerRole }: PaymentBreakdownProps) {
  // Marketplace fee display: platform default 15%. Ignore legacy grade-band
  // rates (10–14%) so pilot summaries match the admin ledger. Keep intentional
  // admin overrides outside that band (e.g. 7.5% or 20%).
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
  const feeAmount = calculateCommission(payment.amountGross, rate).amount;
  const amountNet = calculateCommission(payment.amountGross, rate).amountNet;
  const ratePercent = Math.round(rate * 1000) / 10;

  return (
    <div className="ras-panel space-y-4">
      <h3 className="ras-panel-title">Payment summary</h3>
      <dl className="ras-dl ras-dl--2">
        <div>
          <dt>Job total</dt>
          <dd>
            {payment.currency} {payment.amountGross.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt>Platform fee ({ratePercent}%)</dt>
          <dd>
            {payment.currency} {feeAmount.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt>{viewerRole === "client" ? "Paid to pilot" : "Your payout"}</dt>
          <dd className="ras-accent">
            {payment.currency} {amountNet.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd className="capitalize">{payment.status}</dd>
        </div>
      </dl>
      <p className="ras-help">
        Recorded when the booking was marked completed. Payment gateway integration
        is planned for a later release.
      </p>
    </div>
  );
}
