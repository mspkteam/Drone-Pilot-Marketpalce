import Link from "next/link";
import { brandClasses } from "@/lib/design/brand";
import { homeAssets } from "@/lib/marketing/home-assets";
import {
  HOME_GRADE_BENEFITS_HREF,
  HOME_PILOT_RANKS,
} from "@/lib/marketing/home-content";
import { PilotRankCard } from "@/components/marketing/home/PilotRankCard";

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
      className="figma-home-rank-section"
      aria-label="Pilot rank progression"
    >
      <div className="public-container figma-home-rank-container">
        <div className="figma-home-rank-header">
          <div className="figma-home-rank-intro">
            <p className="figma-home-rank-eyebrow">PROFESSIONAL HIERARCHY</p>
            <h2 className="figma-home-rank-title">The Aviator Grade Progression</h2>
            <p className="figma-home-rank-body">
              Every pilot on our platform is awarded an aviation-based grade
              <br className="figma-home-rank-body-break" />
              relative to their membership status, flight performance, and safety
              record.
            </p>
          </div>
          <Link
            href={HOME_GRADE_BENEFITS_HREF}
            className={`${brandClasses.btnHomeMuted} figma-home-rank-doc-btn`}
          >
            Grade Benefits Documentation
          </Link>
        </div>

        <div className="figma-home-ranks-grid">
          {HOME_PILOT_RANKS.map((rank) => (
            <PilotRankCard
              key={rank.code}
              rank={rank}
              badgeSrc={RANK_BADGES[rank.badge]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
