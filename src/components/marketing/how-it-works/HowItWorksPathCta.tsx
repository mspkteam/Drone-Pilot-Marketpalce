import Link from "next/link";

export function HowItWorksPathCta() {
  return (
    <section
      className="figma-home-waitlist border-t border-ras-border-muted"
      aria-label="Choose your path"
    >
      <div className="public-container py-20 sm:py-28">
        <div className="mx-auto text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ras-cta sm:text-4xl">
            Choose Your Path
          </h2>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register?role=pilot"
              className="inline-flex h-12 min-w-[11rem] items-center justify-center rounded-lg border border-ras-cta bg-ras-soft px-8 text-sm font-bold text-ras-text transition-colors hover:bg-surface"
            >
              Apply as Pilot
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 min-w-[11rem] items-center justify-center rounded-lg border border-ras-cta bg-transparent px-8 text-sm font-bold text-ras-cta transition-colors hover:bg-ras-cta/10"
            >
              View Pilot Plans
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
