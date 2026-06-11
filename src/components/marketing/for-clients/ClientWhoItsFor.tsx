import Image from "next/image";
import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { CLIENT_AUDIENCE_CARDS } from "@/lib/marketing/for-clients-content";

export function ClientWhoItsFor() {
  return (
    <section className="figma-marketing-section" aria-label="Who it's for">
      <div className="public-container">
        <MarketingSectionLabel>Who It&apos;s For</MarketingSectionLabel>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-ras-heading sm:text-4xl">
          Built for Teams That Need Aerial Work
        </h2>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CLIENT_AUDIENCE_CARDS.map((card) => (
            <li
              key={card.title}
              className="figma-marketing-card flex flex-col gap-2 p-6"
            >
              <Image
                src={card.icon}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
                aria-hidden
              />
              <h3 className="pt-2 text-base font-bold tracking-tight text-ras-heading">
                {card.title}
              </h3>
              <p className="text-sm leading-relaxed text-ras-warm">
                {card.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
