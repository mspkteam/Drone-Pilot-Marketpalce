import Image from "next/image";
import Link from "next/link";
import { HOME_AUDIENCE_CARDS } from "@/lib/marketing/home-content";
import { homeAssets } from "@/lib/marketing/home-assets";

function CheckBullet() {
  return (
    <Image
      src={homeAssets.trust.verified}
      alt=""
      width={19}
      height={19}
      className="mt-0.5 h-[1.2rem] w-[1.2rem] shrink-0 object-contain"
      aria-hidden
    />
  );
}

export function HomeAudienceCards() {
  return (
    <section className="figma-home-section" aria-label="Client and pilot value">
      <div className="public-container">
        <div className="grid gap-6 lg:grid-cols-2">
          {HOME_AUDIENCE_CARDS.map((card) => (
            <article
              key={card.side}
              className="figma-home-audience-card flex flex-col justify-between p-10 sm:p-11"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-0.5 w-12 bg-gold" aria-hidden />
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-gold">
                    {card.label}
                  </p>
                </div>
                <h2 className="ras-hero-title mt-6 text-2xl uppercase sm:text-[1.65rem]">
                  {card.title}
                </h2>
                <p className="ras-hero-body mt-5 text-base">{card.description}</p>
                <ul className="mt-8 space-y-4">
                  {card.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm text-[var(--color-text)]">
                      <CheckBullet />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={card.linkHref}
                className="mt-10 text-xs font-semibold uppercase tracking-[0.1em] text-gold hover:text-gold-light"
              >
                {card.linkLabel}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
