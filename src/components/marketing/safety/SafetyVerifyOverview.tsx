import Image from "next/image";
import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { SAFETY_VERIFY_CARDS } from "@/lib/marketing/safety-content";

export function SafetyVerifyOverview() {
  return (
    <section
      id="safety-overview"
      className="figma-safety-section figma-marketing-section scroll-mt-24"
      aria-label="What we verify"
    >
      <div className="public-container">
        <MarketingSectionLabel>Overview</MarketingSectionLabel>
        <h2 className="ras-marketing-section-title mt-3 max-w-2xl">
          What We Verify
        </h2>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SAFETY_VERIFY_CARDS.map((card) => (
            <li key={card.title} className="ras-marketing-icon-card">
              <Image
                src={card.icon}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 object-contain"
                aria-hidden
              />
              <h3 className="pt-2 text-base font-bold tracking-[-0.02em] text-ras-heading">
                {card.title}
              </h3>
              <p className="text-sm leading-[1.45] text-ras-warm">{card.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
