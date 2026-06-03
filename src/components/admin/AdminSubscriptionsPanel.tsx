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
        setError(data.error ?? "Failed to load subscriptions.");
        setPlans([]);
        setSubscriptions([]);
      } else {
        setPlans(data.plans ?? []);
        setSubscriptions(data.subscriptions ?? []);
      }
    } catch {
      setError("Failed to load subscriptions.");
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
            <h2 className="text-lg font-semibold">Plans</h2>
            <p className="text-sm text-muted-foreground">
              Plan CRUD and Stripe billing are deferred; seed defines Basic and
              Pro.
            </p>
            <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
              {plans.map((p) => (
                <li key={p.id} className="p-4">
                  <p className="font-medium">
                    {p.name}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({p.slug})
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {p.currency} {p.priceMonthly}/mo · {p.subscriberCount}{" "}
                    subscriber{p.subscriberCount === 1 ? "" : "s"} ·{" "}
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
                No pilot subscriptions yet.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
                {subscriptions.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{s.pilotName}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.pilotEmail} · {s.planName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Period ends{" "}
                        {new Date(s.currentPeriodEnd).toLocaleDateString()}
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
