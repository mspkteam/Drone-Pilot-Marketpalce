import Link from "next/link";

export function PilotPageHero() {
  return (
    <section className="figma-pilot-hero relative overflow-hidden border-b border-[rgba(218,176,65,0.12)]">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-[28rem] w-[32rem] rounded-full bg-[rgba(156,118,38,0.22)] blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_35%,rgba(156,118,38,0.22),transparent_42%)]"
        aria-hidden
      />
      <div className="public-container relative py-24 sm:py-28 lg:py-32">
        <div className="max-w-[40rem]">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(216,179,57,0.35)] bg-[rgba(216,179,57,0.06)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
            For Pilots
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-ras-text sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
            Grow Your Drone Pilot Career with{" "}
            <span className="text-gold">Remote Air Service</span>
          </h1>
          <p className="mt-6 max-w-[34rem] text-base leading-[1.7] text-ras-muted sm:text-lg">
            Join a professional aviation-style network where approved drone pilots
            can build reputation, access projects, and grow their business.
          </p>
          <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
            <Link
              href="/register?role=pilot"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-gold px-6 text-sm font-bold text-ras-cta transition-colors hover:bg-gold-light"
            >
              Apply as Pilot
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-gold px-6 text-sm font-bold text-gold transition-colors hover:bg-gold/10"
            >
              View Pilot Plans
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
