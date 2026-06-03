import { listActivePlans } from "@/lib/subscriptions/subscription";
import { DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";
import { Button } from "@/components/ui/Button";

export async function PricingPlans() {
  const plans = await listActivePlans();
  const commissionPercent = Math.round(DEFAULT_COMMISSION_RATE * 100);

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-lg font-semibold">For clients</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Posting jobs and hiring pilots is free in Phase 1. A{" "}
          {commissionPercent}% platform commission applies on completed bookings
          (calculated from the agreed job amount).
        </p>
        <div className="mt-6 rounded-lg border border-border bg-surface-elevated p-6">
          <p className="text-3xl font-bold">Pay per mission</p>
          <p className="mt-2 text-sm text-muted-foreground">
            No subscription required. You pay the pilot&apos;s agreed rate; the
            platform fee is recorded when the booking completes.
          </p>
          <Button href="/register" className="mt-6">
            Post a job
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">For pilots</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Monthly plans unlock marketplace access. Choose a tier that fits your
          flight volume.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col rounded-lg border border-border bg-surface-elevated p-6"
            >
              <p className="font-semibold">{plan.name}</p>
              <p className="mt-2 text-3xl font-bold">
                {plan.currency} {plan.priceMonthly.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground">
                  /mo
                </span>
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
                {plan.features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <Button href="/register" variant="outline" className="mt-6">
                Join as pilot
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
