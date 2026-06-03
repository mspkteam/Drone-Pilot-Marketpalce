"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubscriptionStatusBadge } from "@/components/subscriptions/SubscriptionStatusBadge";
import { Button } from "@/components/ui/Button";
import type { MembershipTierDto } from "@/types/membership";
import type {
  PilotSubscriptionDto,
  SubscriptionStatus,
} from "@/types/subscription";

function formatDelay(hours: number) {
  if (hours === 0) return "Immediate";
  if (hours === 1) return "1 hour";
  return `${hours} hours`;
}

export function PilotSubscriptionManager() {
  const router = useRouter();
  const [plans, setPlans] = useState<MembershipTierDto[]>([]);
  const [subscription, setSubscription] = useState<PilotSubscriptionDto | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function load() {
    const [plansRes, subRes] = await Promise.all([
      fetch("/api/pilot/subscription/plans"),
      fetch("/api/pilot/subscription"),
    ]);
    const plansData = await plansRes.json();
    const subData = await subRes.json();

    if (plansData.error) {
      setError(plansData.error);
    } else {
      setPlans(plansData.plans ?? []);
    }
    if (!subData.error) {
      setSubscription(subData.subscription ?? null);
    }
  }

  useEffect(() => {
    load()
      .catch(() => setError("Failed to load membership data."))
      .finally(() => setLoading(false));
  }, []);

  async function handleEnroll(planId: string) {
    setError(null);
    setActionLoading(planId);
    try {
      const res = await fetch("/api/pilot/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to enroll.");
        return;
      }
      setSubscription(data.subscription);
      router.refresh();
    } catch {
      setError("Failed to enroll.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel() {
    setError(null);
    setActionLoading("cancel");
    try {
      const res = await fetch("/api/pilot/subscription", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to cancel.");
        return;
      }
      setSubscription(null);
      router.refresh();
    } catch {
      setError("Failed to cancel.");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading membership tiers…</p>;
  }

  const activePlan = subscription?.plan;

  return (
    <div className="space-y-8">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {activePlan ? (
        <div className="rounded-lg border border-gold/30 bg-gold/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gold-dark">
                Current membership
              </p>
              <p className="mt-1 text-lg font-semibold">{activePlan.name}</p>
              <p className="text-xs text-muted-foreground">{activePlan.code}</p>
            </div>
            <SubscriptionStatusBadge
              status={subscription!.status as SubscriptionStatus}
            />
          </div>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Yearly price</dt>
              <dd className="font-medium">
                {activePlan.currency} {activePlan.priceYearly.toFixed(2)}/year
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Job visibility</dt>
              <dd className="font-medium">
                {formatDelay(activePlan.jobVisibilityDelayHours)} after approval
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Bidding</dt>
              <dd className="font-medium">
                {activePlan.canApply ? "Allowed" : "View only (upgrade to A-2+)"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Instructor eligible</dt>
              <dd className="font-medium">
                {activePlan.instructorEligible ? "Yes" : "No"}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            Demo mode: enrollment is recorded internally — no Stripe or card required.
            Renews {new Date(subscription!.currentPeriodEnd).toLocaleDateString()}.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            disabled={actionLoading !== null}
            onClick={handleCancel}
          >
            {actionLoading === "cancel" ? "Cancelling…" : "Cancel membership"}
          </Button>
        </div>
      ) : (
        <p className="rounded-lg border border-border bg-surface-elevated px-4 py-3 text-sm text-muted-foreground">
          No active membership. Select an A-1 through A-6 tier below (demo billing — no
          card required).
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col rounded-lg border border-border bg-surface-elevated p-6"
          >
            <p className="font-semibold">{plan.name}</p>
            <p className="mt-2 text-2xl font-bold">
              {plan.currency} {plan.priceYearly.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground">/yr</span>
            </p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
              <li>· Visibility: {formatDelay(plan.jobVisibilityDelayHours)}</li>
              <li>
                · {plan.canApply ? "Can submit bids" : "View jobs only — no bidding"}
              </li>
              {plan.instructorEligible ? (
                <li>· Instructor eligible</li>
              ) : null}
              {plan.features.slice(0, 2).map((feature) => (
                <li key={feature}>· {feature}</li>
              ))}
            </ul>
            <Button
              type="button"
              className="mt-6"
              disabled={subscription !== null || actionLoading !== null}
              onClick={() => handleEnroll(plan.id)}
            >
              {actionLoading === plan.id ? "Enrolling…" : "Select tier"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
