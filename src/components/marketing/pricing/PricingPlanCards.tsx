import Image from "next/image";
import Link from "next/link";
import { PricingFeatureIcon } from "@/components/marketing/pricing/PricingFeatureIcon";
import { PRICING_PLANS } from "@/lib/marketing/pricing-content";
import {
  getPricingPlanButtonHref,
  RECOMMENDED_PRICING_PLAN_CODE,
  type PricingPilotContext,
} from "@/lib/marketing/pricing-pilot-context";
import { homeAssets } from "@/lib/marketing/home-assets";
import { cn } from "@/lib/utils";

function PlanBadge({ type }: { type: "current" | "recommended" }) {
  if (type === "current") {
    return (
      <span className="ras-badge ras-badge--success shrink-0 px-2.5 py-1 text-[10px] tracking-[0.08em]">
        Current
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-full border border-[rgba(216,179,57,0.35)] bg-[rgba(216,179,57,0.1)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-gold">
      Recommended
    </span>
  );
}

type PricingPlanCardsProps = Pick<
  PricingPilotContext,
  "currentPlanCode" | "isPilot"
>;

export function PricingPlanCards({
  currentPlanCode,
  isPilot,
}: PricingPlanCardsProps) {
  const upgradeHref = getPricingPlanButtonHref(isPilot);

  return (
    <section
      className="figma-pricing-plans figma-marketing-section"
      aria-label="Membership plans"
    >
      <div className="public-container">
        <ul className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => {
            const isCurrent = currentPlanCode === plan.code;
            const isRecommended =
              !isCurrent &&
              plan.code === RECOMMENDED_PRICING_PLAN_CODE &&
              currentPlanCode !== RECOMMENDED_PRICING_PLAN_CODE;

            return (
              <li
                key={plan.code}
                className={cn(
                  "figma-pricing-plan-card flex h-full flex-col rounded-[10px] border p-7",
                  isRecommended
                    ? "figma-pricing-plan-card--recommended"
                    : "border-[rgba(216,179,57,0.14)]",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-gold">
                    {plan.code}
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

                <h2 className="mt-4 text-[1.375rem] font-bold leading-tight tracking-tight text-ras-text">
                  {plan.title}
                </h2>

                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-[2rem] font-extrabold leading-none text-gold">
                    ${plan.priceMonthly}
                  </span>
                  <span className="text-sm font-medium text-ras-soft">
                    /month
                  </span>
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
                    className="mt-8 flex h-10 w-full cursor-not-allowed items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-surface text-xs font-bold uppercase tracking-[0.06em] text-ras-soft"
                  >
                    Current Plan
                  </button>
                ) : (
                  <Link
                    href={upgradeHref}
                    className="mt-8 flex h-10 w-full items-center justify-center rounded-lg bg-gold text-xs font-bold uppercase tracking-[0.06em] text-ras-cta transition-colors hover:bg-gold-light"
                  >
                    Upgrade to {plan.code}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
