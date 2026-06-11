export function HowItWorksHero() {
  return (
    <section className="figma-how-it-works-hero relative overflow-hidden border-b border-[rgba(218,176,65,0.12)]">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-[28rem] w-[32rem] rounded-full bg-[rgba(156,118,38,0.22)] blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_35%,rgba(156,118,38,0.22),transparent_42%)]"
        aria-hidden
      />
      <div className="public-container relative py-24 sm:py-28 lg:py-32">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(216,179,57,0.35)] bg-[rgba(216,179,57,0.06)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
            Process
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-ras-text sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
            How <span className="text-gold">Remote Air Service</span> works
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.7] text-ras-muted sm:text-lg">
            A simple process for clients who need drone services and pilots who
            want professional opportunities.
          </p>
        </div>
      </div>
    </section>
  );
}
