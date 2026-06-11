import Link from "next/link";

export function AboutPathCta() {
  return (
    <section
      className="figma-home-waitlist border-t border-[rgba(77,70,53,0.5)]"
      aria-label="Join the marketplace"
    >
      <div className="public-container py-24 sm:py-28">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ras-cta sm:text-4xl">
            Join the Future of
            <br />
            Professional Drone Services
          </h2>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/for-clients"
              className="inline-flex h-10 min-w-[11rem] items-center justify-center rounded-lg border border-ras-cta bg-transparent px-8 text-sm font-bold text-ras-cta transition-colors hover:bg-ras-cta/10"
            >
              Hire a Drone Pilot
            </Link>
            <Link
              href="/register?role=pilot"
              className="inline-flex h-10 min-w-[11rem] items-center justify-center rounded-lg border border-ras-cta bg-ras-soft px-8 text-sm font-bold text-ras-text transition-colors hover:bg-surface"
            >
              Apply as Pilot
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
