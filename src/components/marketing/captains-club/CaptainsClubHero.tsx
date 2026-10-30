import Image from "next/image";
import Link from "next/link";
import {
  CAPTAINS_CLUB_HERO,
  CAPTAINS_CLUB_ROUTES,
} from "@/lib/marketing/captains-club-content";
import { homeAssets } from "@/lib/marketing/home-assets";

type CaptainsClubHeroProps = {
  hireHref?: string | null;
  browseHref?: string;
};

export function CaptainsClubHero({
  hireHref = CAPTAINS_CLUB_ROUTES.hireCaptain,
  browseHref = CAPTAINS_CLUB_ROUTES.browseAllPilots,
}: CaptainsClubHeroProps) {
  return (
    <section className="captains-club-hero">
      <div className="captains-club-hero-glow" aria-hidden />
      <div className="public-container captains-club-hero-inner">
        <div className="captains-club-hero-copy">
          <h1 className="captains-club-hero-title">
            {CAPTAINS_CLUB_HERO.titleLead}{" "}
            <span className="captains-club-hero-title-accent">
              {CAPTAINS_CLUB_HERO.titleAccent}
            </span>
          </h1>
          <p className="captains-club-hero-eyebrow">{CAPTAINS_CLUB_HERO.eyebrow}</p>
          <p className="captains-club-hero-desc">{CAPTAINS_CLUB_HERO.description}</p>
          <div className="captains-club-hero-actions">
            {hireHref ? (
              <Link href={hireHref} className="ras-btn-primary">
                Hire a Captain
              </Link>
            ) : null}
            <Link href={browseHref} className="ras-btn-outline">
              Browse All Pilots
            </Link>
          </div>
        </div>
        <div className="captains-club-hero-media">
          <Image
            src={homeAssets.heroPilot}
            alt="Remote Air Service captain in an aviation control environment"
            width={560}
            height={420}
            className="captains-club-hero-image"
            priority
          />
        </div>
      </div>
    </section>
  );
}
