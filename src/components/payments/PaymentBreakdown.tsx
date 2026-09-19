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
  // Flat platform fee (15%). Recompute for display so legacy grade-based
  // commission rows (e.g. 13.5% → $405 on $3000) do not mislead pilots.
  const { amount: feeAmount, amountNet } = calculateCommission(
    payment.amountGross,
    DEFAULT_COMMISSION_RATE,
  );
  const ratePercent = Math.round(DEFAULT_COMMISSION_RATE * 100);

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
