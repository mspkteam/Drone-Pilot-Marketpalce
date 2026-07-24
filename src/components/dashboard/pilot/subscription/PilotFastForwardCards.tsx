import Image from "next/image";
import { PricingFeatureIcon } from "@/components/marketing/pricing/PricingFeatureIcon";
import {
  formatMembershipUsd,
  getUpgradeDifferenceUsd,
  PILOT_ANNUAL_MEMBERSHIP_FEE_USD,
  totalAtSignupUsd,
  type PilotFastForwardTier,
} from "@/lib/membership/pilot-membership-catalog";
import { homeAssets } from "@/lib/marketing/home-assets";
import { cn } from "@/lib/utils";
import type { MembershipTierDto } from "@/types/membership";

export type PilotFastForwardCardModel = PilotFastForwardTier & {
  planId: string;
  planName: string;
  sortOrder: number;
};

type PilotFastForwardCardsProps = {
  cards: PilotFastForwardCardModel[];
  currentTierCode: string | null;
  hasActiveSubscription: boolean;
  actionLoading: string | null;
  onSelectPlan: (planId: string) => void;
};

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

function cardActionLabel(
  card: PilotFastForwardCardModel,
  isCurrent: boolean,
  hasActiveSubscription: boolean,
  currentTierCode: string | null,
): string {
  if (isCurrent) {
    return "Current Plan";
  }
  if (card.isStartingGrade && !hasActiveSubscription) {
    return "Starting Grade";
  }
  if (hasActiveSubscription && currentTierCode) {
    const diff = getUpgradeDifferenceUsd(currentTierCode, card.tierCode);
    return diff > 0
      ? `Upgrade to ${card.pricingCode} — ${formatMembershipUsd(diff)}`
      : `Upgrade to ${card.pricingCode}`;
  }
  return `Upgrade to ${card.pricingCode}`;
}

export function PilotFastForwardCards({
  cards,
  currentTierCode,
  hasActiveSubscription,
  actionLoading,
  onSelectPlan,
}: PilotFastForwardCardsProps) {
  return (
    <ul className="pilot-subscription-ff-grid">
      {cards.map((card) => {
        const isCurrent = currentTierCode === card.tierCode;
        const isRecommended = card.isRecommended && !isCurrent;
        const isLoading = actionLoading === card.planId;
        const isBelowOrEqual =
          hasActiveSubscription &&
          currentTierCode !== null &&
          card.sortOrder <=
            (cards.find((entry) => entry.tierCode === currentTierCode)
              ?.sortOrder ?? 0);
        const actionDisabled =
          isCurrent ||
          isBelowOrEqual ||
          actionLoading !== null;
        const signupTotal = totalAtSignupUsd(card.fastForwardFeeUsd);
        const upgradeDiff =
          hasActiveSubscription && currentTierCode
            ? getUpgradeDifferenceUsd(currentTierCode, card.tierCode)
            : null;

        return (
          <li
            key={card.tierCode}
            className={cn(
              "pilot-subscription-ff-card pilot-subscription-bracket-card",
              isRecommended && "pilot-subscription-ff-card--recommended",
              isCurrent && "pilot-subscription-ff-card--current",
            )}
          >
            {isRecommended ? (
              <span className="pilot-subscription-ff-ribbon">Recommended</span>
            ) : null}

            <div className="pilot-subscription-ff-card-head">
              <p className="pilot-subscription-ff-code">{card.pricingCode}</p>
              {isCurrent ? <PlanBadge type="current" /> : null}
              {!isCurrent && isRecommended ? (
                <PlanBadge type="recommended" />
              ) : null}
            </div>

            <Image
              src={homeAssets.pricingRanks[card.rankKey]}
              alt=""
              width={52}
              height={52}
              className="pilot-subscription-ff-rank"
              aria-hidden
            />

            <h3 className="pilot-subscription-ff-title">{card.shortTitle}</h3>

            {card.isStartingGrade ? (
              <p className="pilot-subscription-ff-note">
                No Fast Forward upgrade fee. All new pilots may start here.
              </p>
            ) : (
              <p className="pilot-subscription-ff-fee-label">
                One-time Fast Forward fee
              </p>
            )}

            <p className="pilot-subscription-ff-fee">
              {formatMembershipUsd(card.fastForwardFeeUsd)}
            </p>

            {!hasActiveSubscription && card.fastForwardFeeUsd > 0 ? (
              <div className="pilot-subscription-ff-signup-total">
                <div>
                  <p className="pilot-subscription-ff-signup-label">
                    Total at signup
                  </p>
                  <p className="pilot-subscription-ff-signup-breakdown">
                    ({formatMembershipUsd(PILOT_ANNUAL_MEMBERSHIP_FEE_USD)} membership +{" "}
                    {formatMembershipUsd(card.fastForwardFeeUsd)})
                  </p>
                </div>
                <p className="pilot-subscription-ff-signup-amount">
                  {formatMembershipUsd(signupTotal)}
                </p>
              </div>
            ) : null}

            {hasActiveSubscription &&
            !isCurrent &&
            upgradeDiff !== null &&
            upgradeDiff > 0 ? (
              <p className="pilot-subscription-ff-upgrade-diff">
                Pay {formatMembershipUsd(upgradeDiff)} difference
              </p>
            ) : null}

            <ul className="pilot-subscription-ff-features">
              {card.features.map((feature) => (
                <li key={feature}>
                  <PricingFeatureIcon included />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className={cn(
                "pilot-subscription-plan-btn mt-auto",
                isCurrent || isBelowOrEqual
                  ? "pilot-subscription-plan-btn--current"
                  : "pilot-subscription-plan-btn--select",
              )}
              disabled={actionDisabled}
              onClick={() => onSelectPlan(card.planId)}
            >
              {isLoading
                ? "Processing…"
                : cardActionLabel(
                    card,
                    isCurrent,
                    hasActiveSubscription,
                    currentTierCode,
                  )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function mergeFastForwardCards(
  tiers: PilotFastForwardTier[],
  plans: MembershipTierDto[],
): PilotFastForwardCardModel[] {
  const planByCode = new Map(plans.map((plan) => [plan.code, plan]));

  return tiers
    .map((tier) => {
      const plan = planByCode.get(tier.tierCode);
      if (!plan) return null;
      return {
        ...tier,
        planId: plan.id,
        planName: plan.name,
        sortOrder: plan.sortOrder,
        isRecommended:
          tier.isRecommended || plan.isRecommended === true,
      };
    })
    .filter((entry): entry is PilotFastForwardCardModel => entry !== null);
}
