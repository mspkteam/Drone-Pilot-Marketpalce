import Image from "next/image";
import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { ABOUT_DIFFERENTIATOR_CARDS } from "@/lib/marketing/about-content";
import { cn } from "@/lib/utils";

export function AboutDifferentiators() {
  return (
    <section
      className="figma-about-section figma-marketing-section border-t border-[rgba(255,255,255,0.05)]"
      aria-label="What makes us different"
    >
      <div className="public-container">
        <MarketingSectionLabel>What Makes Us Different</MarketingSectionLabel>
        <h2 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-ras-text sm:text-4xl">
          An Aviation-Inspired Marketplace
        </h2>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ABOUT_DIFFERENTIATOR_CARDS.map((card) => (
            <li
              key={card.title}
              className={cn(
                "flex min-h-[9.5rem] flex-col rounded-[14px] border border-ras-gold-subtle bg-ras-card p-6",
                "transition-colors hover:border-[rgba(216,179,57,0.22)]",
              )}
            >
              <Image
                src={card.icon}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 object-contain"
                aria-hidden
              />
              <h3 className="mt-5 text-[15px] font-bold tracking-tight text-ras-text">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-[1.55] text-ras-soft">
                {card.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
