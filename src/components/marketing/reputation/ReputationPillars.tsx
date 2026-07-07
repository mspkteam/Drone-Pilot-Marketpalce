import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { REPUTATION_PILLARS } from "@/lib/marketing/reputation-content";

export function ReputationPillars() {
  return (
    <section
      className="figma-marketing-section"
      aria-label="How reputation works"
    >
      <div className="public-container">
        <MarketingSectionLabel>Overview</MarketingSectionLabel>
        <h2 className="ras-marketing-section-title mt-3 max-w-2xl">
          How Pilots Build Reputation
        </h2>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REPUTATION_PILLARS.map((pillar) => (
            <li key={pillar.title} className="ras-marketing-icon-card">
              <h3 className="text-base font-bold tracking-[-0.02em] text-ras-heading">
                {pillar.title}
              </h3>
              <p className="text-sm leading-[1.45] text-ras-warm">
                {pillar.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
