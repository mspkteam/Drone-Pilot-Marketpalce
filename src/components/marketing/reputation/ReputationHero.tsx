import { REPUTATION_HERO } from "@/lib/marketing/reputation-content";

export function ReputationHero() {
  return (
    <section className="figma-reputation-hero ras-hero-section relative overflow-hidden">
      <div
        className="ras-gold-glow pointer-events-none absolute -right-16 top-[-12rem] h-[35rem] w-[37.5rem] sm:-right-32 sm:top-0"
        aria-hidden
      />
      <div className="public-container relative py-16 sm:py-24 lg:py-32">
        <div className="max-w-[42rem]">
          <span className="ras-eyebrow-pill">
            <span className="ras-eyebrow-pill-dot" aria-hidden />
            {REPUTATION_HERO.eyebrow}
          </span>
          <h1 className="ras-hero-title mt-6 text-[1.875rem] leading-[1.05] sm:text-5xl lg:text-[3.75rem] lg:leading-[1.05]">
            {REPUTATION_HERO.title}{" "}
            <span className="ras-hero-title-accent">{REPUTATION_HERO.titleAccent}</span>
          </h1>
          <p className="ras-hero-body mt-6 max-w-xl text-base sm:text-lg">
            {REPUTATION_HERO.body}
          </p>
        </div>
      </div>
    </section>
  );
}
