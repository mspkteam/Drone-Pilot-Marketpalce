"use client";

import Image from "next/image";
import { PricingFeatureIcon } from "@/components/marketing/pricing/PricingFeatureIcon";
import { homeAssets } from "@/lib/marketing/home-assets";
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
  const rankSrc = plan.rankKey ? homeAssets.ranks[plan.rankKey] : null;
  const priceLabel =
    plan.currency === "USD"
      ? `$${plan.priceMonthly.toLocaleString()}`
      : `${plan.currency} ${plan.priceMonthly.toLocaleString()}`;

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

      <p className="admin-subscriptions-tier-price">
        <span className="admin-subscriptions-tier-price-value">{priceLabel}</span>
        <span className="admin-subscriptions-tier-price-unit">/month</span>
      </p>

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
