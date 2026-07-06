import Link from "next/link";
import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { brandClasses } from "@/lib/design/brand";
import {
  PILOT_MEMBERSHIP_INTRO,
  PILOT_MEMBERSHIP_PREVIEW,
} from "@/lib/marketing/for-pilots-content";

export function PilotMembershipPreview() {
  return (
    <section
      className="figma-pilot-section figma-marketing-section"
      aria-label="Membership"
    >
      <div className="public-container">
        <div className="mx-auto max-w-[46.875rem] text-center">
          <MarketingSectionLabel centered>Membership</MarketingSectionLabel>
          <h2 className="ras-marketing-section-title mt-3">
            Choose the level that matches your commitment
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ras-warm">
            {PILOT_MEMBERSHIP_INTRO}
          </p>
        </div>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PILOT_MEMBERSHIP_PREVIEW.map((tier) => (
            <li
              key={tier.code}
              className="figma-pilot-membership-card flex min-h-[9rem] flex-col p-[25px]"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-gold">
                {tier.code}
              </p>
              <h3 className="mt-2 text-[2rem] font-bold leading-tight tracking-tight text-ras-heading">
                {tier.title}
              </h3>
              <p className="mt-2 text-sm text-ras-warm">{tier.subtitle}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12 text-center">
          <Link
            href="/pricing"
            className={`${brandClasses.btnHomeGold} ras-btn-home-gold--sentence`}
          >
            View All Pilot Plans
          </Link>
        </div>
      </div>
    </section>
  );
}
