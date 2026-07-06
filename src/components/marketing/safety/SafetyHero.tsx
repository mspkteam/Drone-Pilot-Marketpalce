import Link from "next/link";
import { brandClasses } from "@/lib/design/brand";

export function SafetyHero() {
  return (
    <section className="figma-safety-hero ras-hero-section relative overflow-hidden">
      <div
        className="ras-gold-glow pointer-events-none absolute -right-16 top-[-12rem] h-[35rem] w-[37.5rem] sm:-right-32 sm:top-0"
        aria-hidden
      />
      <div className="public-container relative py-16 sm:py-24 lg:py-[7rem]">
        <div className="max-w-[56rem]">
          <span className={brandClasses.eyebrowPill}>
            <span className="ras-eyebrow-pill-dot" aria-hidden />
            Safety
          </span>
          <h1 className={`${brandClasses.heroTitle} mt-6 text-[1.875rem] leading-[1.05] sm:text-5xl lg:text-[3.75rem] lg:leading-[1.05]`}>
            Safety and Verification
            <span className="ras-hero-title-split">
              <span className="ras-hero-title-accent">Come First</span>
            </span>
          </h1>
          <p className={`${brandClasses.heroBody} mt-6 max-w-[42rem] text-base sm:text-lg`}>
            Remote Air Service is built around professional standards, pilot
            review, and safer drone project workflows.
          </p>
          <Link
            href="#safety-overview"
            className={`${brandClasses.btnHomeGold} ras-btn-home-gold--sentence mt-8 w-full max-w-xs sm:w-auto sm:max-w-none`}
          >
            Learn How Verification Works
          </Link>
        </div>
      </div>
    </section>
  );
}
