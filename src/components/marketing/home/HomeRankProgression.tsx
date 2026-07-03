import Image from "next/image";
import Link from "next/link";
import { brandClasses } from "@/lib/design/brand";
import { HOME_PILOT_RANKS } from "@/lib/marketing/home-content";import { homeAssets } from "@/lib/marketing/home-assets";
import { cn } from "@/lib/utils";

const RANK_BADGES: Record<(typeof HOME_PILOT_RANKS)[number]["badge"], string> = {
  a1: homeAssets.ranks.a1,
  a2: homeAssets.ranks.a2,
  a3: homeAssets.ranks.a3,
  a4: homeAssets.ranks.a4,
  a5: homeAssets.ranks.a5,
  a6: homeAssets.ranks.a6,
};

export function HomeRankProgression() {
  return (
    <section
      className="figma-home-section border-t border-[var(--color-border)]"
      aria-label="Pilot rank progression"
    >
      <div className="public-container">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="ras-section-eyebrow tracking-[0.12em]">
              PROFESSIONAL HIERARCHY
            </p>
            <h2 className="ras-hero-title mt-4 text-2xl sm:text-[2rem]">
              The Aviator Grade Progression
            </h2>
            <p className="ras-hero-body mt-4 text-base">
              Every pilot on our platform is awarded an aviation-based grade relative
              to their membership status, flight performance, and safety record.
            </p>
          </div>
          <Link
            href="/pricing"
            className={cn(brandClasses.btnHomeMuted, "w-full text-center sm:w-auto")}
          >
            Grade Benefits Documentation
          </Link>        </div>

        <div className="figma-home-ranks-scroll mt-12 flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-6">
          {HOME_PILOT_RANKS.map((rank) => (
            <article
              key={rank.code}
              className={cn(
                "figma-home-rank-card relative min-w-[11.5rem] shrink-0 p-6 text-center md:min-w-0",
                rank.elite && "figma-home-rank-card--elite",
              )}
            >
              {rank.elite ? (
                <span className="absolute right-2 top-2 rounded bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-waitlist-text)]">
                  Elite
                </span>
              ) : null}
              <Image
                src={RANK_BADGES[rank.badge]}
                alt={`${rank.code} ${rank.name} rank insignia`}
                width={27}
                height={46}
                className="mx-auto h-[2.875rem] w-auto object-contain"
              />
              <p className="mt-4 font-mono text-xs font-bold text-gold">{rank.code}</p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-foreground">
                {rank.name}
              </p>
              <div className="mx-auto mt-3 h-px w-full max-w-[9rem] bg-[var(--color-border-muted)]" />
              <p className="mt-3 text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                {rank.subtitle}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
