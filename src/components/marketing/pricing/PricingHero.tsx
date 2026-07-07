import Link from "next/link";
import { brandClasses } from "@/lib/design/brand";

export function PricingHero() {
  return (
    <section className="figma-pricing-hero ras-hero-section relative overflow-hidden">
      <div
        className="ras-gold-glow pointer-events-none absolute -right-16 top-[-12rem] h-[35rem] w-[37.5rem] sm:-right-32 sm:top-0"
        aria-hidden
      />
      <div className="public-container relative py-16 sm:py-24 lg:py-32">
        <div className="max-w-[37.5rem]">
          <span className={brandClasses.eyebrowPill}>
            <span className="ras-eyebrow-pill-dot" aria-hidden />
            PRICING
          </span>
          <h1 className={`${brandClasses.heroTitle} mt-6 text-[1.875rem] leading-[1.05] sm:text-5xl lg:text-[3.75rem] lg:leading-[1.05]`}>
            Pilot <span className="ras-hero-title-accent">Membership</span>
          </h1>
          <p className={`${brandClasses.heroBody} mt-6 max-w-xl text-base sm:text-lg`}>
            Members only! $99.99/year membership fee, plus optional one-time
            Fast Forward grades that unlock earlier job visibility and higher limits.
          </p>
          <Link
            href="/register?role=pilot"
            className={`${brandClasses.btnHomeGold} ras-btn-home-gold--sentence mt-8 w-full max-w-xs sm:w-auto sm:max-w-none`}
          >
            Join as Pilot
          </Link>
        </div>
      </div>
    </section>
  );
}
