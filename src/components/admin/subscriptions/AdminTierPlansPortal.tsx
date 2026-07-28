"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminTierEnrollments } from "@/components/admin/subscriptions/AdminTierEnrollments";
import { AdminTierPlanCard } from "@/components/admin/subscriptions/AdminTierPlanCard";
import { AdminTierPlanEditModal } from "@/components/admin/subscriptions/AdminTierPlanEditModal";
import { DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";
import type {
  AdminPlanDto,
  AdminPlanUpdateInput,
  AdminSubscriptionRowDto,
  AdminSubscriptionStatsDto,
} from "@/types/admin";

const EMPTY_STATS: AdminSubscriptionStatsDto = {
  activeSubscribers: 0,
  activeSubscribersSubtext: "—",
  monthlyRecurring: "$0",
  monthlyRecurringSubtext: "from enrolled pilots",
  avgTier: "—",
  avgTierSubtext: "across all pilots",
  churnRate: "—",
  churnRateSubtext: "no subscription activity yet",
  usingMockChurn: false,
};

type EditState = {
  plan: AdminPlanDto;
  focusFeatures: boolean;
};

export function AdminTierPlansPortal() {
  const [plans, setPlans] = useState<AdminPlanDto[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionRowDto[]>(
    [],
  );
  const [stats, setStats] = useState<AdminSubscriptionStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/subscriptions");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load subscription data.");
        setPlans([]);
        setSubscriptions([]);
        setStats(null);
      } else {
        setPlans(data.plans ?? []);
        setSubscriptions(data.subscriptions ?? []);
        setStats(data.stats ?? null);
      }
    } catch {
      setError("Failed to load subscription data.");
      setPlans([]);
      setSubscriptions([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSavePlan(input: AdminPlanUpdateInput) {
    if (!editState) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/admin/subscriptions/${editState.plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "Failed to save plan.");
        return;
      }
      const updated = data.plan as AdminPlanDto;
      setPlans((current) =>
        current.map((plan) => {
          if (plan.id === updated.id) return updated;
          if (updated.isRecommended && plan.isRecommended) {
            return { ...plan, isRecommended: false };
          }
          return plan;
        }),
      );
      setEditState(null);
    } catch {
      setSaveError("Failed to save plan.");
    } finally {
      setSaving(false);
    }
  }

  const displayStats = stats ?? EMPTY_STATS;
  const commissionPct = Math.round(DEFAULT_COMMISSION_RATE * 100);

  return (
    <div className="admin-subscriptions-page">
      <section
        className="admin-subscriptions-hero admin-ops-bracket-card"
        aria-label="Pilot tier plans"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-subscriptions-hero-inner">
          <div className="admin-subscriptions-hero-copy">
            <p className="admin-ops-eyebrow">SUBSCRIPTION MANAGEMENT</p>
            <h1 className="admin-subscriptions-hero-title">Officer Tier Plans</h1>
            <p className="admin-subscriptions-hero-desc">
              Six membership grades from Student A-1 to Captain A-6. Edit pricing,
              features and commission rates without redeploying.
            </p>
          </div>
          <div className="admin-subscriptions-hero-actions">
            <Link
              href="/pricing"
              className="admin-subscriptions-btn admin-subscriptions-btn--ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              Preview Pilot View
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <p className="admin-subscriptions-banner admin-subscriptions-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="admin-subscriptions-loading">Loading tier plans…</p>
      ) : (
        <>
          <section className="admin-subscriptions-stats-grid" aria-label="Subscription statistics">
            <article className="admin-subscriptions-stat-card">
              <p className="admin-subscriptions-stat-label">ACTIVE SUBSCRIBERS</p>
              <p className="admin-subscriptions-stat-value">
                {displayStats.activeSubscribers.toLocaleString()}
              </p>
              <p className="admin-subscriptions-stat-sub admin-subscriptions-stat-sub--success">
                {displayStats.activeSubscribersSubtext}
              </p>
            </article>
            <article className="admin-subscriptions-stat-card">
              <p className="admin-subscriptions-stat-label">ANNUAL RECURRING</p>
              <p className="admin-subscriptions-stat-value">
                {displayStats.monthlyRecurring}
              </p>
              <p
                className={`admin-subscriptions-stat-sub${
                  stats ? "" : " admin-subscriptions-stat-sub--success"
                }`}
              >
                {displayStats.monthlyRecurringSubtext}
              </p>
            </article>
            <article className="admin-subscriptions-stat-card">
              <p className="admin-subscriptions-stat-label">AVG. TIER</p>
              <p className="admin-subscriptions-stat-value">{displayStats.avgTier}</p>
              <p className="admin-subscriptions-stat-sub">{displayStats.avgTierSubtext}</p>
            </article>
            <article className="admin-subscriptions-stat-card">
              <p className="admin-subscriptions-stat-label">CHURN RATE</p>
              <p className="admin-subscriptions-stat-value">{displayStats.churnRate}</p>
              <p
                className={`admin-subscriptions-stat-sub${
                  displayStats.usingMockChurn
                    ? ""
                    : " admin-subscriptions-stat-sub--success"
                }`}
              >
                {displayStats.churnRateSubtext}
              </p>
            </article>
          </section>

          <section className="admin-subscriptions-tier-grid" aria-label="Membership tier plans">
            {plans.map((plan) => (
              <AdminTierPlanCard
                key={plan.id}
                plan={plan}
                onEdit={() => setEditState({ plan, focusFeatures: false })}
                onManageFeatures={() =>
                  setEditState({ plan, focusFeatures: true })
                }
              />
            ))}
          </section>

          <section className="admin-subscriptions-commission-card" aria-label="Commission rules">
            <h2 className="admin-subscriptions-commission-title">Commission Rules</h2>
            <p className="admin-subscriptions-commission-body">
              Default platform commission: {commissionPct}%
            </p>
            <p className="admin-subscriptions-commission-note">
              Edit default and per-grade commission rates (A-1 through A-6) in{" "}
              <Link href="/dashboard/admin/settings">Platform Settings</Link>.
            </p>
          </section>

          <AdminTierEnrollments subscriptions={subscriptions} />
        </>
      )}

      {editState ? (
        <AdminTierPlanEditModal
          plan={plans.find((entry) => entry.id === editState.plan.id) ?? editState.plan}
          focusFeatures={editState.focusFeatures}
          saving={saving}
          error={saveError}
          onClose={() => {
            if (!saving) {
              setEditState(null);
              setSaveError(null);
            }
          }}
          onSave={handleSavePlan}
        />
      ) : null}
    </div>
  );
}
