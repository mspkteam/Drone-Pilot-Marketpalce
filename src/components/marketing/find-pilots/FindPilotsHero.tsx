import Image from "next/image";
import Link from "next/link";
import { homeAssets } from "@/lib/marketing/home-assets";

export function FindPilotsHero() {
  return (
    <section className="find-pilots-hero">
      <div className="find-pilots-hero-glow" aria-hidden />
      <div className="public-container find-pilots-hero-inner">
        <div className="find-pilots-hero-copy">
          <p className="find-pilots-hero-eyebrow">PILOT DIRECTORY</p>
          <h1 className="find-pilots-hero-title">
            Find <span className="find-pilots-hero-title-accent">Pilots</span>
          </h1>
          <p className="find-pilots-hero-desc">
            Browse approved, marketplace-verified drone pilots by location, services,
            and ratings. Compare profiles before you post a project.
          </p>
          <div className="find-pilots-hero-actions">
            <Link href="/register?role=client" className="ras-btn-primary">
              Post a Project
            </Link>
            <Link href="/captains-club" className="ras-btn-outline">
              Captain&apos;s Club
            </Link>
          </div>
        </div>
        <div className="find-pilots-hero-media">
          <Image
            src={homeAssets.heroDrone}
            alt="Drone pilot on an enterprise mission"
            width={560}
            height={420}
            className="find-pilots-hero-image"
            priority
          />
        </div>
      </div>
    </section>
  );
}
