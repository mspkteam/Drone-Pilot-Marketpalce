import Image from "next/image";
import Link from "next/link";
import { PricingFeatureIcon } from "@/components/marketing/pricing/PricingFeatureIcon";
import {
  MARKETING_GRADE_PLANS,
  totalAtSignupUsd,
} from "@/lib/marketing/pricing-content";
import {
  formatMembershipUsd,
  PILOT_ANNUAL_MEMBERSHIP_FEE_USD,
} from "@/lib/membership/pilot-membership-catalog";
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
      aria-label="Fast Forward grades"
    >
      <div className="public-container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">
            Fast Forward grades
          </p>
          <h2 className="ras-marketing-section-title mt-3">
            Choose your starting grade
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ras-warm">
            One-time Fast Forward fee plus{" "}
            {formatMembershipUsd(PILOT_ANNUAL_MEMBERSHIP_FEE_USD)}/year membership
            at signup. Upgrade later by paying the difference only.
          </p>
        </div>

        <ul className="mt-12 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MARKETING_GRADE_PLANS.map((plan) => {
            const isCurrent = currentPlanCode === plan.code;
            const isRecommended =
              !isCurrent &&
              plan.code === RECOMMENDED_PRICING_PLAN_CODE &&
              currentPlanCode !== RECOMMENDED_PRICING_PLAN_CODE;
            const signupTotal = totalAtSignupUsd(plan.fastForwardFeeUsd);

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

                <h3 className="mt-4 text-[1.375rem] font-bold leading-tight tracking-tight text-ras-text">
                  {plan.title}
                </h3>

                {plan.isStartingGrade ? (
                  <p className="mt-3 text-[13px] leading-snug text-ras-soft">
                    No Fast Forward fee. All new pilots may start here.
                  </p>
                ) : (
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ras-soft">
                    One-time Fast Forward fee
                  </p>
                )}

                <p className="mt-2 flex items-baseline gap-1">
                  <span className="text-[2rem] font-extrabold leading-none text-gold">
                    {formatMembershipUsd(plan.fastForwardFeeUsd)}
                  </span>
                </p>

                {plan.fastForwardFeeUsd > 0 ? (
                  <div className="mt-4 rounded-lg border border-[rgba(216,179,57,0.12)] bg-[rgba(21,17,12,0.35)] px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ras-soft">
                      Total at signup
                    </p>
                    <p className="mt-1 text-lg font-extrabold text-ras-heading">
                      {formatMembershipUsd(signupTotal)}
                    </p>
                    <p className="mt-1 text-[11px] text-ras-dim">
                      ({formatMembershipUsd(PILOT_ANNUAL_MEMBERSHIP_FEE_USD)}{" "}
                      membership + {formatMembershipUsd(plan.fastForwardFeeUsd)})
                    </p>
                  </div>
                ) : null}

                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.label}
                      className="flex items-start gap-2.5 text-[13px] leading-snug text-ras-muted"
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
                    {plan.isStartingGrade ? "Start at A-1" : `Fast Forward to ${plan.code}`}
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
