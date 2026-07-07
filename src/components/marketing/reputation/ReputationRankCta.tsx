import Link from "next/link";
import { brandClasses } from "@/lib/design/brand";
import { REPUTATION_RANK_NOTE } from "@/lib/marketing/reputation-content";

export function ReputationRankCta() {
  return (
    <section
      className="figma-marketing-section border-t border-[rgba(255,255,255,0.05)]"
      aria-label="Grade benefits"
    >
      <div className="public-container">
        <div className="max-w-2xl">
          <h2 className="ras-marketing-section-title">{REPUTATION_RANK_NOTE.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-ras-warm">
            {REPUTATION_RANK_NOTE.body}
          </p>
          <Link
            href={REPUTATION_RANK_NOTE.ctaHref}
            className={`${brandClasses.btnHomeGold} ras-btn-home-gold--sentence mt-8 inline-flex`}
          >
            {REPUTATION_RANK_NOTE.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
