import Link from "next/link";

export function PricingCta() {
  return (
    <section
      className="figma-home-waitlist border-t border-[rgba(77,70,53,0.5)]"
      aria-label="Apply as pilot"
    >
      <div className="public-container py-24 sm:py-28">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ras-cta sm:text-4xl">
            Ready to Start Your Pilot Membership?
          </h2>
          <Link
            href="/register?role=pilot"
            className="mt-10 inline-flex h-10 items-center justify-center rounded-lg border border-ras-cta bg-ras-soft px-10 text-sm font-bold text-ras-text transition-colors hover:bg-surface"
          >
            Apply as Pilot
          </Link>
        </div>
      </div>
    </section>
  );
}
