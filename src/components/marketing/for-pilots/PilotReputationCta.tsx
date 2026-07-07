import Link from "next/link";
import { brandClasses } from "@/lib/design/brand";
import { PILOT_REPUTATION_COPY } from "@/lib/marketing/for-pilots-content";

export function PilotReputationCta() {
  return (
    <section
      className="figma-pilot-section figma-marketing-section"
      aria-label="Reputation system"
    >
      <div className="public-container px-[var(--dashboard-padding-mobile)] sm:px-0">
        <div className="max-w-[42rem] px-4 sm:px-0 lg:px-[3.5625rem]">
          <h2 className="text-[1.875rem] font-bold leading-tight tracking-tight text-ras-heading sm:text-3xl">
            {PILOT_REPUTATION_COPY.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ras-warm">
            {PILOT_REPUTATION_COPY.body}
          </p>
          <Link
            href="/reputation"
            className={`${brandClasses.btnHomeMuted} ras-btn-home-muted--compact mt-6`}
          >
            Explore Reputation System
          </Link>
        </div>
      </div>
    </section>
  );
}
