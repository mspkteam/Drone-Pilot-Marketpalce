import Link from "next/link";
import { StarRating } from "@/components/reviews/StarRating";
import { Button } from "@/components/ui/Button";
import {
  formatPilotLocation,
  formatPilotRateRange,
  serviceLabel,
} from "@/lib/pilot/format";
import { WingBadge } from "@/components/wings/WingBadge";
import { getVerificationTypeLabel } from "@/lib/verification/status";
import type { PublicPilotProfileDto } from "@/types/public-pilot";

export function PublicPilotProfile({ pilot }: { pilot: PublicPilotProfileDto }) {
  const location = formatPilotLocation(
    pilot.locationCity,
    pilot.locationRegion,
    pilot.locationCountry,
  );
  const rate = formatPilotRateRange(pilot.hourlyRateMin, pilot.hourlyRateMax);

  return (
    <div className="space-y-10">
      <div className="rounded-lg border border-border bg-surface-elevated p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              {pilot.displayName}
            </h1>
            <p className="mt-2 text-muted-foreground">{location}</p>
            {pilot.verifiedTypes.length > 0 || pilot.wings.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {pilot.wings.map((w) => (
                  <WingBadge
                    key={w.code}
                    title={w.title}
                    iconLabel={w.iconLabel}
                    category={w.category}
                  />
                ))}
                {pilot.verifiedTypes.map((t) => (
                  <span
                    key={t}
                    className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
                  >
                    Verified {getVerificationTypeLabel(t)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          {pilot.reviewCount > 0 && pilot.averageRating != null ? (
            <div className="text-right">
              <StarRating value={Math.round(pilot.averageRating)} size="md" />
              <p className="mt-1 text-sm text-muted-foreground">
                {pilot.averageRating} average · {pilot.reviewCount} review
                {pilot.reviewCount === 1 ? "" : "s"}
              </p>
            </div>
          ) : null}
        </div>

        {pilot.bio ? (
          <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed">
            {pilot.bio}
          </p>
        ) : null}

        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rate ? (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Hourly rate
              </dt>
              <dd className="mt-1 font-medium">{rate}</dd>
            </div>
          ) : null}
          {pilot.serviceRadiusKm != null ? (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Service radius
              </dt>
              <dd className="mt-1 font-medium">{pilot.serviceRadiusKm} km</dd>
            </div>
          ) : null}
          <div className="sm:col-span-2 lg:col-span-1">
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Services
            </dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {pilot.servicesOffered.map((id) => (
                <span
                  key={id}
                  className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs"
                >
                  {serviceLabel(id)}
                </span>
              ))}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/register">Hire via marketplace</Button>
          <Button href="/pilots" variant="outline">
            Browse more pilots
          </Button>
        </div>
      </div>

      {pilot.recentReviews.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold">Recent reviews</h2>
          <ul className="mt-4 space-y-4">
            {pilot.recentReviews.map((review) => (
              <li
                key={review.id}
                className="rounded-lg border border-border p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{review.authorLabel}</p>
                  <StarRating value={review.rating} size="sm" />
                </div>
                {review.comment ? (
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                    {review.comment}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/pilots" className="text-gold-dark hover:text-gold">
          ← Back to all pilots
        </Link>
      </p>
    </div>
  );
}
