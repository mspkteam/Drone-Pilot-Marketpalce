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
    <div className="rounded-lg border border-border bg-surface-elevated p-6 space-y-4">
      <h3 className="font-medium">Payment summary</h3>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Job total</dt>
          <dd className="font-medium">
            {payment.currency} {payment.amountGross.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">
            Platform fee ({ratePercent}%)
          </dt>
          <dd className="font-medium">
            {payment.currency} {feeAmount.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">
            {viewerRole === "client" ? "Paid to pilot" : "Your payout"}
          </dt>
          <dd className="font-medium text-gold-dark">
            {payment.currency} {amountNet.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Status</dt>
          <dd className="capitalize">{payment.status}</dd>
        </div>
      </dl>
      <p className="text-xs text-muted-foreground">
        Recorded when the booking was marked completed. Payment gateway integration
        is planned for a later release.
      </p>
    </div>
  );
}
