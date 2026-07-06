import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import {
  MARKETING_MEMBERSHIP_INTRO,
  PILOT_ANNUAL_MEMBERSHIP_BENEFITS,
} from "@/lib/marketing/pricing-content";

export function PricingMembershipIntro() {
  return (
    <section
      className="figma-pricing-membership figma-marketing-section border-b border-[rgba(255,255,255,0.05)]"
      aria-label="Annual membership"
    >
      <div className="public-container">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start lg:gap-14">
          <div>
            <MarketingSectionLabel>{MARKETING_MEMBERSHIP_INTRO.eyebrow}</MarketingSectionLabel>
            <h2 className="ras-marketing-section-title mt-3 max-w-xl">
              {MARKETING_MEMBERSHIP_INTRO.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ras-warm">
              {MARKETING_MEMBERSHIP_INTRO.body}
            </p>
          </div>

          <div className="figma-pricing-membership-card rounded-[14px] border border-[rgba(216,179,57,0.16)] bg-ras-card-warm-alt p-7">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-gold">
              {MARKETING_MEMBERSHIP_INTRO.feeLabel}
            </p>
            <p className="mt-3 flex items-baseline gap-1">
              <span className="text-[2rem] font-extrabold leading-none text-gold">
                {MARKETING_MEMBERSHIP_INTRO.feeAmount}
              </span>
              <span className="text-sm font-medium text-ras-soft">
                {MARKETING_MEMBERSHIP_INTRO.feePeriod}
              </span>
            </p>
            <ul className="mt-6 flex flex-col gap-2.5">
              {PILOT_ANNUAL_MEMBERSHIP_BENEFITS.slice(0, 5).map((benefit) => (
                <li
                  key={benefit}
                  className="text-[13px] leading-snug text-ras-muted"
                >
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
