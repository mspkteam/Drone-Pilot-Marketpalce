import { ABOUT_AUDIENCE_CARDS } from "@/lib/marketing/about-content";

export function AboutAudience() {
  return (
    <section
      className="figma-about-section figma-marketing-section border-t border-[rgba(255,255,255,0.05)]"
      aria-label="Who we serve"
    >
      <div className="public-container">
        <ul className="grid gap-5 lg:grid-cols-2">
          {ABOUT_AUDIENCE_CARDS.map((card) => (
            <li
              key={card.title}
              className="rounded-[14px] border border-[rgba(216,179,57,0.18)] border-l-[3px] border-l-gold bg-ras-card-warm-alt p-6 sm:p-7"
            >
              <h2 className="text-xl font-bold tracking-tight text-ras-text sm:text-[1.35rem]">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-[1.65] text-ras-soft sm:text-base">
                {card.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
