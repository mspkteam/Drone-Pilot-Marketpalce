import Link from "next/link";
import { StarRating } from "@/components/reviews/StarRating";
import {
  formatPilotLocation,
  formatPilotRateRange,
  serviceLabel,
} from "@/lib/pilot/format";
import { isPublicPilotProfileEnabled } from "@/lib/public-access";
import type { PublicPilotListItemDto } from "@/types/public-pilot";

export function PublicPilotCard({ pilot }: { pilot: PublicPilotListItemDto }) {
  const location = formatPilotLocation(
    pilot.locationCity,
    pilot.locationRegion,
    pilot.locationCountry,
  );
  const rate = formatPilotRateRange(pilot.hourlyRateMin, pilot.hourlyRateMax);
  const profileEnabled = isPublicPilotProfileEnabled();

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{pilot.displayName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{location}</p>
        </div>
        {pilot.reviewCount > 0 && pilot.averageRating != null ? (
          <div className="flex flex-col items-end gap-1">
            <StarRating value={Math.round(pilot.averageRating)} size="sm" />
            <span className="text-xs text-muted-foreground">
              {pilot.averageRating} ({pilot.reviewCount})
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">New pilot</span>
        )}
      </div>
      {pilot.bio ? (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {pilot.bio}
        </p>
      ) : null}
      <p className="mt-3 text-xs text-muted-foreground">
        {pilot.servicesOffered.slice(0, 3).map(serviceLabel).join(" · ")}
        {pilot.servicesOffered.length > 3 ? " · …" : ""}
      </p>
      {rate ? (
        <p className="mt-3 text-sm font-medium text-gold-dark">{rate}</p>
      ) : null}
    </>
  );

  const className = `flex flex-col rounded-lg border border-border bg-surface-elevated p-6${
    profileEnabled ? " transition-colors hover:border-gold/40" : ""
  }`;

  if (!profileEnabled) {
    return <article className={className}>{content}</article>;
  }

  return (
    <Link href={`/pilots/${pilot.id}`} className={className}>
      {content}
    </Link>
  );
}
