"use client";

import { useCallback, useEffect, useState } from "react";
import { SubscriptionStatusBadge } from "@/components/subscriptions/SubscriptionStatusBadge";
import { Button } from "@/components/ui/Button";
import type { AdminPlanDto, AdminSubscriptionRowDto } from "@/types/admin";
import type { SubscriptionStatus } from "@/types/subscription";

export function AdminSubscriptionsPanel() {
  const [plans, setPlans] = useState<AdminPlanDto[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionRowDto[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/subscriptions");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load memberships.");
        setPlans([]);
        setSubscriptions([]);
      } else {
        setPlans(data.plans ?? []);
        setSubscriptions(data.subscriptions ?? []);
      }
    } catch {
      setError("Failed to load memberships.");
      setPlans([]);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-8">
      <Button type="button" variant="ghost" size="sm" onClick={() => void load()}>
        Refresh
      </Button>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <section>
            <h2 className="text-lg font-semibold">Membership tiers (A-1 – A-6)</h2>
            <p className="text-sm text-muted-foreground">
              Demo/internal billing only — Stripe deferred.
            </p>
            <ul className="mt-4 list-panel">
              {plans.map((p) => (
                <li key={p.id} className="p-4">
                  <p className="font-medium">
                    {p.name}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({p.code})
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {p.currency} {p.priceYearly.toFixed(2)}/yr · visibility{" "}
                    {p.jobVisibilityDelayHours}h ·{" "}
                    {p.canApply ? "can bid" : "view only"} ·{" "}
                    {p.instructorEligible ? "instructor" : "not instructor"} ·{" "}
                    {p.subscriberCount} enrolled ·{" "}
                    {p.isActive ? "Active" : "Inactive"}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Pilot enrollments</h2>
            {subscriptions.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No pilot memberships yet.
              </p>
            ) : (
              <ul className="mt-4 list-panel">
                {subscriptions.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{s.pilotName}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.pilotEmail} · {s.planName} ({s.tierCode})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Visibility {s.jobVisibilityDelayHours}h ·{" "}
                        {s.canApply ? "can bid" : "view only"} ·{" "}
                        {s.instructorEligible ? "instructor" : "not instructor"} ·
                        ends {new Date(s.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                    <SubscriptionStatusBadge
                      status={s.status as SubscriptionStatus}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
