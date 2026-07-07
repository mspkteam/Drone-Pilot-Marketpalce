import Link from "next/link";
import { brandClasses } from "@/lib/design/brand";

export function PilotPageHero() {
  return (
    <section className="figma-pilot-hero ras-hero-section relative overflow-hidden">
      <div
        className="ras-gold-glow pointer-events-none absolute -right-16 top-[-12rem] h-[35rem] w-[37.5rem] sm:-right-32 sm:top-0"
        aria-hidden
      />
      <div className="public-container relative py-16 sm:py-24 lg:py-[7rem]">
        <div className="max-w-[56rem]">
          <span className={brandClasses.eyebrowPill}>
            <span className="ras-eyebrow-pill-dot" aria-hidden />
            For Pilots
          </span>
          <h1 className={`${brandClasses.heroTitle} mt-6 text-[1.875rem] leading-[1.08] sm:text-5xl lg:text-[3.75rem] lg:leading-[1.05]`}>
            Grow Your Drone Pilot Career with{" "}
            <span className="ras-hero-title-accent">Remote Air Service</span>
          </h1>
          <p className={`${brandClasses.heroBody} mt-6 max-w-[42rem] text-base sm:text-lg`}>
            Join a professional aviation-style network where approved drone pilots
            can build reputation, access projects, and grow their business.
          </p>
          <div className="mt-8 flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
            <Link
              href="/register?role=pilot"
              className={`${brandClasses.btnHomeGold} ras-btn-home-gold--sentence w-full max-w-xs sm:w-auto sm:max-w-none`}
            >
              Apply as Pilot
            </Link>
            <Link
              href="/pricing"
              className={`${brandClasses.btnHomeHeroLight} ras-btn-home-hero-light--compact w-full max-w-xs sm:w-auto sm:max-w-none`}
            >
              View Pilot Plans
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
