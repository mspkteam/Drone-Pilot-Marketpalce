export function HowItWorksHero() {
  return (
    <section className="figma-how-it-works-hero ras-hero-section relative overflow-hidden">
      <div
        className="ras-gold-glow pointer-events-none absolute -right-16 top-[-12rem] h-[35rem] w-[37.5rem] sm:-right-32 sm:top-0"
        aria-hidden
      />
      <div className="public-container relative py-16 sm:py-20 lg:py-28">
        <div className="max-w-[42.5rem]">
          <span className="ras-eyebrow-pill">
            <span className="ras-eyebrow-pill-dot" aria-hidden />
            PROCESS
          </span>
          <h1 className="ras-hero-title mt-6 text-[1.875rem] leading-[1.08] sm:text-5xl lg:text-[3.75rem] lg:leading-[1.05]">
            How <span className="ras-hero-title-accent">Remote Air Service</span>{" "}
            works
          </h1>
          <p className="ras-hero-body mt-6 max-w-[42rem] text-base sm:text-lg">
            A simple process for clients who need drone services and pilots who
            want professional opportunities.
          </p>
        </div>
      </div>
    </section>
  );
}
