import Image from "next/image";
import { PricingFeatureIcon } from "@/components/marketing/pricing/PricingFeatureIcon";
import {
  isRecommendedPlan,
  type PilotSubscriptionPlanCard,
} from "@/lib/pilot/pilot-subscription-map";
import { homeAssets } from "@/lib/marketing/home-assets";
import { cn } from "@/lib/utils";

function PlanBadge({ type }: { type: "current" | "recommended" }) {
  if (type === "current") {
    return (
      <span className="pilot-subscription-badge pilot-subscription-badge--current">
        Current
      </span>
    );
  }

  return (
    <span className="pilot-subscription-badge pilot-subscription-badge--recommended">
      Recommended
    </span>
  );
}

type PilotSubscriptionPlanCardsProps = {
  plans: PilotSubscriptionPlanCard[];
  currentPricingCode: string | null;
  hasActiveSubscription: boolean;
  actionLoading: string | null;
  onSelectPlan: (planId: string) => void;
};

export function PilotSubscriptionPlanCards({
  plans,
  currentPricingCode,
  hasActiveSubscription,
  actionLoading,
  onSelectPlan,
}: PilotSubscriptionPlanCardsProps) {
  return (
    <ul className="pilot-subscription-plan-grid">
      {plans.map((plan) => {
        const isCurrent = currentPricingCode === plan.pricingCode;
        const isRecommended =
          !isCurrent &&
          isRecommendedPlan(
            plan.pricingCode,
            currentPricingCode,
            plan.isRecommended,
          );
        const isLoading = actionLoading === plan.id;
        const selectDisabled = hasActiveSubscription || actionLoading !== null;

        return (
          <li
            key={plan.id}
            className={cn(
              "figma-pricing-plan-card pilot-subscription-plan-card flex h-full flex-col rounded-[10px] border p-7",
              isRecommended
                ? "figma-pricing-plan-card--recommended"
                : "border-[rgba(216,179,57,0.14)]",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-gold">
                {plan.pricingCode}
              </p>
              {isCurrent ? <PlanBadge type="current" /> : null}
              {isRecommended ? <PlanBadge type="recommended" /> : null}
            </div>

            <Image
              src={homeAssets.ranks[plan.rankKey]}
              alt=""
              width={27}
              height={46}
              className="mt-5 h-11 w-auto object-contain object-left"
              aria-hidden
            />

            <h3 className="mt-4 text-[1.375rem] font-bold leading-tight tracking-tight text-ras-text">
              {plan.title}
            </h3>

            <p className="mt-4 flex items-baseline gap-1">
              <span className="text-[2rem] font-extrabold leading-none text-gold">
                {plan.currency === "USD"
                  ? `$${plan.priceMonthly.toLocaleString()}`
                  : `${plan.currency} ${plan.priceMonthly.toLocaleString()}`}
              </span>
              <span className="text-sm font-medium text-ras-soft">/month</span>
            </p>

            <ul className="mt-6 flex flex-1 flex-col gap-2.5">
              {plan.features.map((feature) => (
                <li
                  key={feature.label}
                  className={cn(
                    "flex items-start gap-2.5 text-[13px] leading-snug",
                    feature.included
                      ? "text-ras-muted"
                      : "text-[rgba(168,162,154,0.35)]",
                  )}
                >
                  <PricingFeatureIcon included={feature.included} />
                  <span>{feature.label}</span>
                </li>
              ))}
            </ul>

            {isCurrent ? (
              <button
                type="button"
                disabled
                className="pilot-subscription-plan-btn pilot-subscription-plan-btn--current mt-8"
              >
                Current Plan
              </button>
            ) : (
              <button
                type="button"
                className="pilot-subscription-plan-btn pilot-subscription-plan-btn--select mt-8"
                disabled={selectDisabled}
                onClick={() => onSelectPlan(plan.id)}
              >
                {isLoading ? "Enrolling…" : "Select tier"}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
