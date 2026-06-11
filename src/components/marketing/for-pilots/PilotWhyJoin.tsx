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
        <h2 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-ras-text sm:text-4xl">
          Built for Professional Drone Pilots
        </h2>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PILOT_WHY_JOIN_CARDS.map((card) => (
            <li
              key={card.title}
              className="flex min-h-[8.25rem] flex-col gap-[7px] rounded-[14px] border border-ras-gold-subtle bg-ras-card p-6 transition-colors hover:border-[rgba(216,179,57,0.22)] hover:bg-surface-elevated"
            >
              <Image
                src={card.icon}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 object-contain"
                aria-hidden
              />
              <h3 className="pt-2 text-[15px] font-bold tracking-tight text-ras-text">
                {card.title}
              </h3>
              <p className="text-sm leading-[1.55] text-ras-dim-alt">
                {card.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
