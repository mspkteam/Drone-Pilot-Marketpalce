import Image from "next/image";
import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { CLIENT_AUDIENCE_CARDS } from "@/lib/marketing/for-clients-content";

export function ClientWhoItsFor() {
  return (
    <section className="figma-marketing-section overflow-x-clip" aria-label="Who it's for">
      <div className="public-container">
        <MarketingSectionLabel>Who It&apos;s For</MarketingSectionLabel>
        <h2 className="ras-marketing-section-title mt-3 max-w-2xl">
          Built for Teams That Need Aerial Work
        </h2>
        <ul className="mt-10 grid auto-rows-fr gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
          {CLIENT_AUDIENCE_CARDS.map((card) => (
            <li
              key={card.title}
              className="figma-marketing-card flex h-full min-h-[10.25rem] flex-col gap-[7px] p-[25px]"
            >
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
              <p className="text-sm leading-relaxed text-ras-warm">{card.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
