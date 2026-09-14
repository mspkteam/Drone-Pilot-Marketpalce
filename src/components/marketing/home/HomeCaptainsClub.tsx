import Link from "next/link";
import { CaptainClubCard } from "@/components/marketing/captains-club/CaptainClubCard";
import { brandClasses } from "@/lib/design/brand";
import { HOME_FEATURED_CAPTAINS_LIMIT } from "@/lib/marketing/home-captains-content";
import { listFeaturedHomeCaptains } from "@/lib/pilot/captains-club-server";
import "@/styles/captains-club.css";

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export async function HomeCaptainsClub() {
  const captains = await listFeaturedHomeCaptains(HOME_FEATURED_CAPTAINS_LIMIT);

  return (
    <section
      className="figma-home-section border-t border-[var(--color-border)]"
      aria-label="Captain's Club"
    >
      <div className="public-container">
        <h2 className="ras-hero-title text-2xl sm:text-[2rem]">
          Captain&apos;s Club
        </h2>

        {captains.length > 0 ? (
          <div className="captains-club-grid mt-10">
            {captains.map((captain) => (
              <CaptainClubCard key={captain.id} captain={captain} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-sm text-[var(--color-text-soft)]">
            Elite A-6 Captains will appear here once their profiles are public.
          </p>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/captains-club"
            className={`${brandClasses.btnHomeGold} w-full max-w-xs sm:w-auto sm:max-w-none`}
          >
            <span>View Captain&apos;s Club</span>
            <ArrowIcon className="h-[0.9375rem] w-[0.9375rem] shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
