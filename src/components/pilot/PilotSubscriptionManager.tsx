"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubscriptionStatusBadge } from "@/components/subscriptions/SubscriptionStatusBadge";
import { Button } from "@/components/ui/Button";
import type {
  PilotSubscriptionDto,
  SubscriptionPlanDto,
  SubscriptionStatus,
} from "@/types/subscription";

export function PilotSubscriptionManager() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);
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
      .catch(() => setError("Failed to load subscription data."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubscribe(planId: string) {
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
        setError(data.error ?? "Failed to subscribe.");
        return;
      }
      setSubscription(data.subscription);
      router.refresh();
    } catch {
      setError("Failed to subscribe.");
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
    return <p className="text-sm text-muted-foreground">Loading plans…</p>;
  }

  return (
    <div className="space-y-8">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {subscription ? (
        <div className="rounded-lg border border-gold/30 bg-gold/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gold-dark">
                Current plan
              </p>
              <p className="mt-1 text-lg font-semibold">{subscription.plan.name}</p>
            </div>
            <SubscriptionStatusBadge
              status={subscription.status as SubscriptionStatus}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {subscription.plan.currency}{" "}
            {subscription.plan.priceMonthly.toLocaleString()}/month
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Renews{" "}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Phase 1: enrollment is recorded locally — payment gateway integration
            comes later.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            disabled={actionLoading !== null}
            onClick={handleCancel}
          >
            {actionLoading === "cancel" ? "Cancelling…" : "Cancel subscription"}
          </Button>
        </div>
      ) : (
        <p className="rounded-lg border border-border bg-surface-elevated px-4 py-3 text-sm text-muted-foreground">
          No active subscription. Choose a plan below to enroll (demo billing —
          no card required).
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col rounded-lg border border-border bg-surface-elevated p-6"
          >
            <p className="font-semibold">{plan.name}</p>
            <p className="mt-2 text-2xl font-bold">
              {plan.currency} {plan.priceMonthly.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">
                /mo
              </span>
            </p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
              {plan.features.map((feature) => (
                <li key={feature}>· {feature}</li>
              ))}
            </ul>
            <Button
              type="button"
              className="mt-6"
              disabled={subscription !== null || actionLoading !== null}
              onClick={() => handleSubscribe(plan.id)}
            >
              {actionLoading === plan.id ? "Enrolling…" : "Subscribe"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
