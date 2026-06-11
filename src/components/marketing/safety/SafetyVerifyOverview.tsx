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
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ras-text sm:text-[2.25rem]">
          What We Verify
        </h2>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SAFETY_VERIFY_CARDS.map((card) => (
            <li
              key={card.title}
              className="flex min-h-[10.5rem] flex-col gap-2 rounded-[10px] border border-ras-gold-subtle bg-ras-card p-7"
            >
              <Image
                src={card.icon}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 object-contain"
                aria-hidden
              />
              <h3 className="pt-2 text-base font-bold tracking-tight text-ras-text">
                {card.title}
              </h3>
              <p className="text-sm leading-relaxed text-ras-soft">
                {card.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
