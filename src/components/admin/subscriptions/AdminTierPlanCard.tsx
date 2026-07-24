"use client";

import Image from "next/image";
import { PricingFeatureIcon } from "@/components/marketing/pricing/PricingFeatureIcon";
import { homeAssets } from "@/lib/marketing/home-assets";
import { formatMembershipUsd } from "@/lib/membership/pilot-membership-catalog";
import { formatJobVisibilityDelay } from "@/lib/subscriptions/status";
import type { AdminPlanDto } from "@/types/admin";

type AdminTierPlanCardProps = {
  plan: AdminPlanDto;
  onEdit: () => void;
  onManageFeatures: () => void;
};

export function AdminTierPlanCard({
  plan,
  onEdit,
  onManageFeatures,
}: AdminTierPlanCardProps) {
  const rankSrc = plan.rankKey ? homeAssets.pricingRanks[plan.rankKey] : null;
  const isStartingGrade = plan.fastForwardFeeUsd <= 0;
  const feeLabel = formatMembershipUsd(plan.fastForwardFeeUsd);
  const membershipLabel = formatMembershipUsd(plan.annualMembershipUsd);
  const totalLabel = formatMembershipUsd(plan.totalAtSignupUsd);

  return (
    <article
      className={`admin-subscriptions-tier-card${
        plan.isRecommended ? " admin-subscriptions-tier-card--recommended" : ""
      }`}
    >
      <div className="admin-subscriptions-tier-head">
        <p className="admin-subscriptions-tier-code">{plan.pricingCode ?? plan.code}</p>
        <div className="admin-subscriptions-tier-badges">
          {plan.isRecommended ? (
            <span className="admin-subscriptions-badge admin-subscriptions-badge--recommended">
              RECOMMENDED
            </span>
          ) : null}
          <span
            className={`admin-subscriptions-badge ${
              plan.isActive
                ? "admin-subscriptions-badge--active"
                : "admin-subscriptions-badge--inactive"
            }`}
          >
            {plan.isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>
      </div>

      {rankSrc ? (
        <Image
          src={rankSrc}
          alt=""
          width={27}
          height={46}
          className="admin-subscriptions-tier-rank"
          aria-hidden
        />
      ) : null}

      <h3 className="admin-subscriptions-tier-name">{plan.name}</h3>

      <p className="admin-subscriptions-tier-fee-label">
        {isStartingGrade ? "Starting grade" : "One-time Fast Forward fee"}
      </p>
      <p className="admin-subscriptions-tier-price">
        <span className="admin-subscriptions-tier-price-value">{feeLabel}</span>
        {!isStartingGrade ? (
          <span className="admin-subscriptions-tier-price-unit">one-time</span>
        ) : null}
      </p>

      {isStartingGrade ? (
        <div className="admin-subscriptions-tier-signup">
          <p className="admin-subscriptions-tier-signup-label">Total at signup</p>
          <p className="admin-subscriptions-tier-signup-value">{membershipLabel}</p>
          <p className="admin-subscriptions-tier-signup-note">
            {membershipLabel}/year membership · no Fast Forward fee
          </p>
        </div>
      ) : (
        <div className="admin-subscriptions-tier-signup">
          <p className="admin-subscriptions-tier-signup-label">Total at signup</p>
          <p className="admin-subscriptions-tier-signup-value">{totalLabel}</p>
          <p className="admin-subscriptions-tier-signup-note">
            {membershipLabel}/year membership + {feeLabel} Fast Forward
          </p>
        </div>
      )}

      <p className="admin-subscriptions-tier-desc">{plan.description}</p>

      <ul className="admin-subscriptions-tier-features">
        {plan.displayFeatures.map((feature) => (
          <li
            key={`${feature.sortOrder}-${feature.label}`}
            className={`admin-subscriptions-tier-feature ${
              feature.included
                ? "admin-subscriptions-tier-feature--included"
                : "admin-subscriptions-tier-feature--excluded"
            }`}
          >
            <span className="admin-subscriptions-tier-feature-icon" aria-hidden>
              <PricingFeatureIcon included={feature.included} />
            </span>
            <span>{feature.label}</span>
          </li>
        ))}
      </ul>

      <p className="admin-subscriptions-tier-meta">
        Visibility: {formatJobVisibilityDelay(plan.jobVisibilityDelayHours)} ·{" "}
        {plan.canApply ? "Can bid" : "View only"} · {plan.subscriberCount} enrolled
      </p>

      <div className="admin-subscriptions-tier-actions">
        <button
          type="button"
          className="admin-subscriptions-tier-btn admin-subscriptions-tier-btn--primary"
          onClick={onEdit}
        >
          Edit Plan
        </button>
        <button
          type="button"
          className="admin-subscriptions-tier-btn admin-subscriptions-tier-btn--ghost"
          onClick={onManageFeatures}
        >
          Manage Features
        </button>
      </div>
    </article>
  );
}
