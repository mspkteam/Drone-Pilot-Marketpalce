import Image from "next/image";
import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { PILOT_WHY_JOIN_CARDS } from "@/lib/marketing/for-pilots-content";

export function PilotWhyJoin() {
  return (
    <section
      className="figma-pilot-section figma-marketing-section"
      aria-label="Why join"
    >
      <div className="public-container">
        <MarketingSectionLabel>Why Join</MarketingSectionLabel>
        <h2 className="ras-marketing-section-title mt-3 max-w-2xl">
          Built for Professional Drone Pilots
        </h2>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PILOT_WHY_JOIN_CARDS.map((card) => (
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
