import Link from "next/link";
import { brandClasses } from "@/lib/design/brand";

export function ClientPageHero() {
  return (
    <section className="figma-client-hero ras-hero-section relative overflow-hidden">
      <div
        className="ras-gold-glow pointer-events-none absolute -right-16 top-[-12rem] h-[35rem] w-[37.5rem] sm:-right-32 sm:top-0"
        aria-hidden
      />
      <div className="public-container relative py-16 sm:py-24 lg:py-32">
        <div className="max-w-[37.5rem]">
          <span className="ras-eyebrow-pill">
            <span className="ras-eyebrow-pill-dot" aria-hidden />
            FOR CLIENTS
          </span>
          <h1 className="ras-hero-title mt-6 text-[1.875rem] leading-[1.05] sm:text-5xl lg:text-[3.75rem] lg:leading-[1.05]">
            Find the Right Drone Pilot for{" "}
            <span className="ras-hero-title-accent">Your Project</span>
          </h1>
          <p className="ras-hero-body mt-6 max-w-[42rem] text-base sm:text-lg">
            Aerial photography, inspections, mapping, or event coverage — Remote Air
            Service connects you with verified drone pilots quickly and safely.
          </p>
          <Link
            href="/register?role=client"
            className={`${brandClasses.btnHomeGold} ras-btn-home-gold--sentence mt-8 w-full max-w-xs sm:w-auto sm:max-w-none`}
          >
            Post a Drone Project
          </Link>
        </div>
      </div>
    </section>
  );
}
