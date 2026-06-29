"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  mergeFastForwardCards,
  PilotFastForwardCards,
} from "@/components/dashboard/pilot/subscription/PilotFastForwardCards";
import { SubscriptionStatusBadge } from "@/components/subscriptions/SubscriptionStatusBadge";
import {
  formatMembershipUsd,
  getFastForwardFeeUsd,
  getUpgradeDifferenceUsd,
  listPilotFastForwardTiers,
  PILOT_ANNUAL_MEMBERSHIP_BENEFITS,
  PILOT_ANNUAL_MEMBERSHIP_FEE_USD,
} from "@/lib/membership/pilot-membership-catalog";
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
  const [success, setSuccess] = useState<string | null>(null);
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

  const fastForwardCards = useMemo(
    () => mergeFastForwardCards(listPilotFastForwardTiers(), plans),
    [plans],
  );

  const a1PlanId = useMemo(
    () => plans.find((plan) => plan.code === "A1_STUDENT")?.id ?? null,
    [plans],
  );

  const currentTierCode = subscription?.plan.code ?? null;

  const upgradeExample = useMemo(() => {
    if (!currentTierCode) {
      return {
        targetLabel: "A-6",
        targetFee: getFastForwardFeeUsd("A6_CAPTAIN"),
        creditFee: getFastForwardFeeUsd("A4_SENIOR_FLIGHT_OFFICER"),
        difference: getUpgradeDifferenceUsd(
          "A4_SENIOR_FLIGHT_OFFICER",
          "A6_CAPTAIN",
        ),
      };
    }

    const currentFee = getFastForwardFeeUsd(currentTierCode);
    const targetTier = "A6_CAPTAIN";
    const targetFee = getFastForwardFeeUsd(targetTier);

    return {
      targetLabel: "A-6",
      targetFee,
      creditFee: currentFee,
      difference: getUpgradeDifferenceUsd(currentTierCode, targetTier),
    };
  }, [currentTierCode]);

  async function handleSelectPlan(planId: string) {
    setError(null);
    setSuccess(null);
    setActionLoading(planId);
    try {
      const res = await fetch("/api/pilot/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update membership.");
        return;
      }

      setSubscription(data.subscription);
      if (data.enrolled) {
        setSuccess(
          `Membership enrolled (demo). Annual fee ${formatMembershipUsd(PILOT_ANNUAL_MEMBERSHIP_FEE_USD)} recorded.`,
        );
      } else if (typeof data.upgradeFeeUsd === "number" && data.upgradeFeeUsd > 0) {
        setSuccess(
          `Fast Forward upgrade recorded (demo). One-time fee ${formatMembershipUsd(data.upgradeFeeUsd)}.`,
        );
      } else {
        setSuccess("Membership grade updated.");
      }
      router.refresh();
    } catch {
      setError("Failed to update membership.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleEnrollAnnual() {
    if (!a1PlanId) {
      setError("Starting grade plan is unavailable.");
      return;
    }
    await handleSelectPlan(a1PlanId);
  }

  async function handleCancel() {
    setError(null);
    setSuccess(null);
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

  return (
    <div className="pilot-subscription-page">
      <section
        className="pilot-subscription-hero pilot-subscription-bracket-card"
        aria-label="Membership overview"
      >
        <p className="pilot-subscription-eyebrow">Business / Membership</p>
        <h1 className="pilot-subscription-title">
          Remote Air Service Membership Plans
        </h1>
        <p className="pilot-subscription-hero-lead">
          One annual membership. Fast Forward your grade with a one-time upgrade.
        </p>
      </section>

      <section
        className="pilot-subscription-info pilot-subscription-bracket-card"
        aria-label="Membership billing"
      >
        <div className="pilot-subscription-info-copy">
          <p className="pilot-subscription-info-title">
            All pilots pay the same annual membership fee of{" "}
            {formatMembershipUsd(PILOT_ANNUAL_MEMBERSHIP_FEE_USD)}.
          </p>
          <p className="pilot-subscription-info-sub">
            Upgrade anytime: pay only the difference
          </p>
        </div>
        <ul className="pilot-subscription-info-list">
          <li>Upgrade (Fast Forward) fees are one-time payments only.</li>
          <li>Membership is billed annually</li>
        </ul>
      </section>

      {error ? (
        <p className="pilot-subscription-banner" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="pilot-subscription-banner pilot-subscription-banner--success" role="status">
          {success}
        </p>
      ) : null}

      {loading ? (
        <p className="pilot-subscription-loading">Loading membership…</p>
      ) : (
        <>
          {activePlan ? (
            <section
              className="pilot-subscription-current pilot-subscription-bracket-card"
              aria-label="Current membership"
            >
              <div className="pilot-subscription-current-head">
                <div>
                  <p className="pilot-subscription-current-eyebrow">
                    Current membership
                  </p>
                  <h2 className="pilot-subscription-current-title">
                    {activePlan.name}
                  </h2>
                  <p className="pilot-subscription-current-code">
                    Annual {formatMembershipUsd(PILOT_ANNUAL_MEMBERSHIP_FEE_USD)}
                    /year · Fast Forward{" "}
                    {formatMembershipUsd(getFastForwardFeeUsd(activePlan.code))}
                  </p>
                </div>
                <SubscriptionStatusBadge
                  status={subscription!.status as SubscriptionStatus}
                />
              </div>

              <dl className="pilot-subscription-current-grid">
                <div>
                  <dt>Job visibility</dt>
                  <dd>
                    {formatJobVisibilityDelay(activePlan.jobVisibilityDelayHours)}
                  </dd>
                </div>
                <div>
                  <dt>Bidding</dt>
                  <dd>
                    {activePlan.canApply
                      ? "Allowed"
                      : "View only (upgrade to A-2+)"}
                  </dd>
                </div>
                <div>
                  <dt>Client search</dt>
                  <dd>
                    {activePlan.sortOrder >= 3 ? "Visible" : "Hidden below A-3"}
                  </dd>
                </div>
                <div>
                  <dt>Renews</dt>
                  <dd>
                    {new Date(subscription!.currentPeriodEnd).toLocaleDateString()}
                  </dd>
                </div>
              </dl>

              <p className="pilot-subscription-current-note">
                Demo mode: enrollment is recorded internally — no Stripe or card
                required.
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
          ) : null}

          <section className="pilot-subscription-section" aria-label="Annual membership">
            <h2 className="pilot-subscription-section-title">
              1. Annual membership
            </h2>
            <div className="pilot-subscription-annual pilot-subscription-bracket-card">
              <div className="pilot-subscription-annual-main">
                <p className="pilot-subscription-annual-price">
                  {formatMembershipUsd(PILOT_ANNUAL_MEMBERSHIP_FEE_USD)}{" "}
                  <span>/ Year</span>
                </p>
                <p className="pilot-subscription-annual-copy">
                  Includes access to jobs, proposals, profile, and core benefits.
                </p>
              </div>
              <ul className="pilot-subscription-annual-benefits">
                {PILOT_ANNUAL_MEMBERSHIP_BENEFITS.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
              {!subscription ? (
                <button
                  type="button"
                  className="pilot-subscription-plan-btn pilot-subscription-plan-btn--select pilot-subscription-annual-btn"
                  disabled={actionLoading !== null || !a1PlanId}
                  onClick={handleEnrollAnnual}
                >
                  {actionLoading === a1PlanId
                    ? "Enrolling…"
                    : `Enroll — ${formatMembershipUsd(PILOT_ANNUAL_MEMBERSHIP_FEE_USD)}/year`}
                </button>
              ) : (
                <p className="pilot-subscription-annual-active" role="status">
                  Annual membership active
                </p>
              )}
            </div>
          </section>

          <section
            className="pilot-subscription-notice pilot-subscription-bracket-card"
            aria-label="Client visibility"
          >
            <p className="pilot-subscription-notice-title">
              Only A-3 and above pilots appear in client search results.
            </p>
            <p className="pilot-subscription-notice-copy">
              Upgrade to A-3 or higher to get visible to clients and grow your
              pilot opportunities.
            </p>
          </section>

          <section className="pilot-subscription-section" aria-label="Fast Forward upgrades">
            <h2 className="pilot-subscription-section-title">
              2. Fast Forward Upgrades (One-time fee — start at a higher grade)
            </h2>
            <PilotFastForwardCards
              cards={fastForwardCards}
              currentTierCode={currentTierCode}
              hasActiveSubscription={subscription !== null}
              actionLoading={actionLoading}
              onSelectPlan={handleSelectPlan}
            />
          </section>

          <section
            className="pilot-subscription-diff pilot-subscription-bracket-card"
            aria-label="Upgrade difference"
          >
            <div>
              <h2 className="pilot-subscription-diff-title">
                Already upgraded? Pay only the difference.
              </h2>
              <p className="pilot-subscription-diff-copy">
                Upgrade anytime and only pay the difference.
              </p>
            </div>
            <dl className="pilot-subscription-diff-grid">
              <div>
                <dt>{upgradeExample.targetLabel} upgrade fee</dt>
                <dd>{formatMembershipUsd(upgradeExample.targetFee)}</dd>
              </div>
              <div>
                <dt>Your current credit</dt>
                <dd>— {formatMembershipUsd(upgradeExample.creditFee)}</dd>
              </div>
              <div>
                <dt>You pay</dt>
                <dd>{formatMembershipUsd(upgradeExample.difference)}</dd>
              </div>
            </dl>
          </section>

          <section
            className="pilot-subscription-captains pilot-subscription-bracket-card"
            aria-label="Captain benefits"
          >
            <div>
              <h2 className="pilot-subscription-captains-title">Captain&apos;s Club</h2>
              <p className="pilot-subscription-captains-copy">
                Captain grade members appear on a public alphabetical list of
                active Captains, and unlock Black Polo Uniform Eligibility.
              </p>
            </div>
            <div>
              <h2 className="pilot-subscription-captains-title">
                Certificate / ID Card Handling
              </h2>
              <p className="pilot-subscription-captains-copy">
                Supports certificate history and downloads. ID cards are mailed
                after 30 approved membership days.
              </p>
            </div>
            <div>
              <h2 className="pilot-subscription-captains-title">Future Roadmap</h2>
              <p className="pilot-subscription-captains-copy">
                Remote Rescue Guidance Squadron, a Joint Search and Rescue venture,
                coming in late 2027
              </p>
            </div>
          </section>

          <div className="pilot-subscription-footer-link">
            <Link href="/pricing" className="pilot-subscription-btn-outline">
              Compare public pricing →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
