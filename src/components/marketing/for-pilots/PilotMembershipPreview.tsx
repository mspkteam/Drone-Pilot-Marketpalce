import Link from "next/link";
import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { PILOT_MEMBERSHIP_PREVIEW } from "@/lib/marketing/for-pilots-content";

export function PilotMembershipPreview() {
  return (
    <section
      className="figma-pilot-section figma-marketing-section"
      aria-label="Membership"
    >
      <div className="public-container">
        <div className="mx-auto max-w-2xl text-center">
          <MarketingSectionLabel centered>Membership</MarketingSectionLabel>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-ras-text sm:text-4xl">
            Choose the Level That Matches Your Growth
          </h2>
        </div>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PILOT_MEMBERSHIP_PREVIEW.map((tier) => (
            <li
              key={tier.code}
              className="figma-pilot-membership-card min-h-[7rem] rounded-[11px] border border-[rgba(216,179,57,0.14)] bg-ras-card-warm-alt p-7"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-gold">
                {tier.code}
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-ras-text">
                {tier.title}
              </h3>
              <p className="mt-2 text-[13px] text-ras-dim-alt">{tier.subtitle}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12 text-center">
          <Link
            href="/pricing"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-gold px-6 text-sm font-bold text-ras-cta transition-colors hover:bg-gold-light"
          >
            View All Pilot Plans
          </Link>
        </div>
      </div>
    </section>
  );
}
