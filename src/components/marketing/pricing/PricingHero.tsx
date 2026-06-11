import Link from "next/link";

export function PricingHero() {
  return (
    <section className="figma-pricing-hero relative overflow-hidden border-b border-[rgba(218,176,65,0.12)]">
      <div
        className="pointer-events-none absolute -right-32 top-0 h-[35rem] w-[37.5rem] rounded-[9rem] bg-[rgba(156,118,38,0.18)] blur-[200px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_35%,rgba(156,118,38,0.22),transparent_42%)]"
        aria-hidden
      />
      <div className="public-container relative py-24 sm:py-28 lg:py-32">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(216,179,57,0.35)] bg-[rgba(216,179,57,0.06)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
            Pricing
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-ras-text sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
            Pilot <span className="text-gold">Membership Plans</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-[1.7] text-ras-muted sm:text-lg">
            Choose a membership level that matches your drone pilot experience,
            goals, and access needs.
          </p>
          <Link
            href="/register?role=pilot"
            className="mt-8 inline-flex h-10 items-center justify-center rounded-lg bg-gold px-8 text-sm font-bold text-ras-cta transition-colors hover:bg-gold-light"
          >
            Join as Pilot
          </Link>
        </div>
      </div>
    </section>
  );
}
