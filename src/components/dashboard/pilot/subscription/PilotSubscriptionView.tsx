"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PilotSubscriptionPlanCards } from "./PilotSubscriptionPlanCards";
import { SubscriptionStatusBadge } from "@/components/subscriptions/SubscriptionStatusBadge";
import {
  getPricingCodeForTier,
  getTierMarketingPrices,
  mapTierToSubscriptionCard,
} from "@/lib/pilot/pilot-subscription-map";
import { formatJobVisibilityDelay } from "@/lib/subscriptions/status";
import type { MembershipTierDto } from "@/types/membership";
import type {
  PilotSubscriptionDto,
  SubscriptionStatus,
} from "@/types/subscription";

export function PilotSubscriptionView() {
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

  const planCards = useMemo(
    () => plans.map(mapTierToSubscriptionCard),
    [plans],
  );

  const currentPricingCode = subscription?.plan.code
    ? getPricingCodeForTier(subscription.plan.code)
    : null;

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

  const activePlan = subscription?.plan;
  const activePlanPrices = activePlan
    ? getTierMarketingPrices(activePlan.code, {
        priceMonthly: activePlan.priceMonthly,
        priceYearly: activePlan.priceYearly,
      })
    : null;

  function formatUsd(amount: number): string {
    return activePlan?.currency === "USD" || !activePlan?.currency
      ? `$${amount.toLocaleString(undefined, {
          minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
          maximumFractionDigits: 2,
        })}`
      : `${activePlan.currency} ${amount.toLocaleString()}`;
  }

  return (
    <div className="pilot-subscription-page">
      <header className="pilot-subscription-header">
        <div className="pilot-subscription-header-copy">
          <h1 className="pilot-subscription-title">Subscription</h1>
          <p className="pilot-subscription-subtitle">
            View and manage your pilot marketplace plan.
          </p>
        </div>
        <div className="pilot-subscription-header-actions">
          <Link href="/pricing" className="pilot-subscription-btn-outline">
            Compare plans →
          </Link>
        </div>
      </header>

      {error ? (
        <p className="pilot-subscription-banner pilot-subscription-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="pilot-subscription-loading">Loading membership tiers…</p>
      ) : (
        <>
          {activePlan ? (
            <section className="pilot-subscription-current" aria-label="Current membership">
              <div className="pilot-subscription-current-head">
                <div>
                  <p className="pilot-subscription-current-eyebrow">Current membership</p>
                  <h2 className="pilot-subscription-current-title">{activePlan.name}</h2>
                  <p className="pilot-subscription-current-code">{activePlan.code}</p>
                </div>
                <SubscriptionStatusBadge
                  status={subscription!.status as SubscriptionStatus}
                />
              </div>

              <dl className="pilot-subscription-current-grid">
                <div>
                  <dt>Monthly price</dt>
                  <dd>
                    {formatUsd(activePlanPrices!.priceMonthly)}/month
                  </dd>
                </div>
                <div>
                  <dt>Yearly price</dt>
                  <dd>
                    {formatUsd(activePlanPrices!.priceYearly)}/year
                  </dd>
                </div>
                <div>
                  <dt>Job visibility</dt>
                  <dd>{formatJobVisibilityDelay(activePlan.jobVisibilityDelayHours)}</dd>
                </div>
                <div>
                  <dt>Bidding</dt>
                  <dd>
                    {activePlan.canApply ? "Allowed" : "View only (upgrade to A-2+)"}
                  </dd>
                </div>
                <div>
                  <dt>Instructor eligible</dt>
                  <dd>{activePlan.instructorEligible ? "Yes" : "No"}</dd>
                </div>
              </dl>

              <p className="pilot-subscription-current-note">
                Demo mode: enrollment is recorded internally — no Stripe or card required.
                Renews {new Date(subscription!.currentPeriodEnd).toLocaleDateString()}.
              </p>

              <button
                type="button"
                className="pilot-subscription-btn-outline"
                disabled={actionLoading !== null}
                onClick={handleCancel}
              >
                {actionLoading === "cancel" ? "Cancelling…" : "Cancel membership"}
              </button>
            </section>
          ) : (
            <p className="pilot-subscription-empty-banner" role="status">
              No active membership. Select an A-1 through A-6 tier below (demo billing — no
              card required).
            </p>
          )}

          <section className="pilot-subscription-panel" aria-label="Membership tiers">
            <div className="pilot-subscription-panel-head">
              <div>
                <h2 className="pilot-subscription-panel-title">Membership tiers</h2>
                <p className="pilot-subscription-panel-subtitle">
                  Choose the plan that matches your mission volume and marketplace access.
                </p>
              </div>
            </div>

            <PilotSubscriptionPlanCards
              plans={planCards}
              currentPricingCode={currentPricingCode}
              hasActiveSubscription={subscription !== null}
              actionLoading={actionLoading}
              onSelectPlan={handleEnroll}
            />
          </section>
        </>
      )}
    </div>
  );
}
