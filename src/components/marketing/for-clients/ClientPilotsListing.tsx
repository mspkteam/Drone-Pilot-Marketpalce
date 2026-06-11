import Link from "next/link";
import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { PublicPilotCard } from "@/components/pilots/PublicPilotCard";
import type { PublicPilotListItemDto } from "@/types/public-pilot";

type ClientPilotsListingProps = {
  pilots: PublicPilotListItemDto[];
};

export function ClientPilotsListing({ pilots }: ClientPilotsListingProps) {
  return (
    <section className="figma-marketing-section" aria-label="Browse pilots">
      <div className="public-container">
        <MarketingSectionLabel>Pilot Directory</MarketingSectionLabel>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-ras-heading sm:text-4xl">
          Browse Verified Pilots
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ras-warm">
          Compare public pilot profiles with ratings, services, and rates before
          you post a project.
        </p>

        {pilots.length === 0 ? (
          <div className="figma-marketing-card mt-10 rounded-[14px] p-12 text-center">
            <p className="text-ras-warm">
              No public pilot profiles yet. Check back soon or{" "}
              <Link href="/for-pilots" className="text-gold hover:text-gold-light">
                join as a pilot
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pilots.map((pilot) => (
                <PublicPilotCard key={pilot.id} pilot={pilot} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/pilots"
                className="text-sm font-semibold text-gold transition-colors hover:text-gold-light"
              >
                View full pilot directory →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
