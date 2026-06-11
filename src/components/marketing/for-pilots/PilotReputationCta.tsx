import Link from "next/link";

export function PilotReputationCta() {
  return (
    <section
      className="figma-marketing-section pt-0"
      aria-label="Reputation system"
    >
      <div className="public-container">
        <div className="rounded-[14px] border border-[rgba(216,179,57,0.16)] bg-ras-section p-10 sm:p-14">
          <h2 className="text-2xl font-extrabold tracking-tight text-ras-text sm:text-3xl">
            Reputation System
          </h2>
          <p className="mt-4 max-w-[45rem] text-[15px] leading-[1.7] text-ras-muted">
            Earn badges, wings, and rank upgrades based on activity, experience,
            performance, and verified flight history.
          </p>
          <Link
            href="/how-it-works"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-gold px-6 text-sm font-bold text-ras-cta transition-colors hover:bg-gold-light"
          >
            Explore Reputation System
          </Link>
        </div>
      </div>
    </section>
  );
}
