import Link from "next/link";
import { StarRating } from "@/components/reviews/StarRating";
import { Button } from "@/components/ui/Button";
import {
  formatPilotLocation,
  formatPilotRateRange,
  serviceLabel,
} from "@/lib/pilot/format";
import { getVerificationTypeLabel } from "@/lib/verification/status";
import { WingBadge } from "@/components/wings/WingBadge";
import { cn } from "@/lib/utils";
import type { PublicPilotProfileDto } from "@/types/public-pilot";

function IconDollar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m-3-2.25h6a2.25 2.25 0 100-4.5h-3a2.25 2.25 0 110-4.5h6"
      />
    </svg>
  );
}

function IconRadius({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    </svg>
  );
}

function IconServices({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );
}

function IconWings({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l2.5 6.5L21 11l-5 4.5L17 21l-5-3-5 3 1-5.5L3 11l6.5-1.5L12 3z"
      />
    </svg>
  );
}

function IconCertificate({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
      />
    </svg>
  );
}

function IconTier({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  );
}

function IconStar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 00.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}

type ProfileModuleCardProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

function ProfileModuleCard({
  title,
  icon,
  children,
  className,
}: ProfileModuleCardProps) {
  return (
    <article
      className={cn(
        "premium-card flex h-full flex-col p-6 transition-shadow duration-200",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-border/80 pb-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold/35 bg-gold/10 text-gold">
          {icon}
        </span>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      <div className="mt-5 flex-1">{children}</div>
    </article>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

function StatCard({ label, value, icon, className, children }: StatCardProps) {
  return (
    <article
      className={cn(
        "premium-card flex h-full flex-col p-6 transition-shadow duration-200",
        className,
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold/35 bg-gold/10 text-gold">
        {icon}
      </span>
      <p className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      {children ? (
        <div className="mt-3 flex-1">{children}</div>
      ) : (
        <p className="mt-2 text-2xl font-bold tracking-tight text-gold-light">
          {value}
        </p>
      )}
    </article>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-dashed border-border bg-surface/40 px-4 py-8 text-center text-sm text-muted-foreground">
      {message}
    </p>
  );
}

function ServiceChip({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold-light">
      {label}
    </span>
  );
}

export function PublicPilotProfile({ pilot }: { pilot: PublicPilotProfileDto }) {
  const location = formatPilotLocation(
    pilot.locationCity,
    pilot.locationRegion,
    pilot.locationCountry,
  );
  const rate =
    formatPilotRateRange(pilot.hourlyRateMin, pilot.hourlyRateMax) ?? "—";
  const hasBadges =
    pilot.wings.length > 0 || pilot.verifiedTypes.length > 0;
  const hasReviews = pilot.reviewCount > 0 && pilot.averageRating != null;
  const latestReview = pilot.recentReviews[0];

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Hero */}
      <article className="premium-panel relative overflow-hidden border-gold/25 p-6 sm:p-8 lg:p-10">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_100%_0%,rgba(201,162,39,0.12),transparent_55%),radial-gradient(ellipse_50%_40%_at_0%_100%,rgba(201,162,39,0.06),transparent_50%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden
        />

        <div className="relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
                Licensed pilot
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {pilot.displayName}
              </h1>
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground sm:text-base">
                <svg
                  className="h-4 w-4 shrink-0 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                {location}
              </p>
              {pilot.bio ? (
                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {pilot.bio}
                </p>
              ) : null}
            </div>

            {hasReviews ? (
              <div className="shrink-0 rounded-xl border border-gold/30 bg-gold/5 px-5 py-4 text-center lg:text-right">
                <StarRating
                  value={Math.round(pilot.averageRating!)}
                  size="md"
                />
                <p className="mt-2 text-2xl font-bold text-gold-light">
                  {pilot.averageRating}
                </p>
                <p className="text-xs text-muted-foreground">
                  {pilot.reviewCount} review{pilot.reviewCount === 1 ? "" : "s"}
                </p>
              </div>
            ) : null}
          </div>

          {hasBadges ? (
            <div className="relative mt-8 border-t border-border/60 pt-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Verifications & achievements
              </p>
              <div className="flex flex-wrap gap-2">
                {pilot.wings.map((w) => (
                  <WingBadge
                    key={w.code}
                    title={w.title}
                    iconLabel={w.iconLabel}
                    category={w.category}
                  />
                ))}
                {pilot.verifiedTypes.map((t) => (
                  <span key={t} className="status-badge status-badge-warning">
                    Verified {getVerificationTypeLabel(t)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </article>

      {/* Stats grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <StatCard
          label="Hourly rate"
          value={rate}
          icon={<IconDollar className="h-5 w-5" />}
        />
        <StatCard
          label="Service radius"
          value={
            pilot.serviceRadiusKm != null
              ? `${pilot.serviceRadiusKm} km`
              : "—"
          }
          icon={<IconRadius className="h-5 w-5" />}
        />
        <StatCard
          label="Services"
          value=""
          icon={<IconServices className="h-5 w-5" />}
          className="sm:col-span-2"
        >
          {pilot.servicesOffered.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {pilot.servicesOffered.map((id) => (
                <ServiceChip key={id} label={serviceLabel(id)} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No services listed.</p>
          )}
        </StatCard>
      </div>

      {/* Extended grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
        <ProfileModuleCard
          title="Digital wings"
          icon={<IconWings className="h-5 w-5" />}
        >
          {pilot.wings.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-gold-light">
                  {pilot.wings.length}
                </span>{" "}
                achievement{pilot.wings.length === 1 ? "" : "s"} earned
              </p>
              <div className="flex flex-wrap gap-2">
                {pilot.wings.map((w) => (
                  <WingBadge
                    key={w.code}
                    title={w.title}
                    iconLabel={w.iconLabel}
                    category={w.category}
                    size="md"
                  />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState message="No wings earned yet." />
          )}
        </ProfileModuleCard>

        <ProfileModuleCard
          title="Certificates"
          icon={<IconCertificate className="h-5 w-5" />}
        >
          <EmptyState message="No certificates issued yet." />
        </ProfileModuleCard>

        <ProfileModuleCard
          title="Membership"
          icon={<IconTier className="h-5 w-5" />}
        >
          <EmptyState message="Membership details are not shown on public profiles." />
        </ProfileModuleCard>

        <ProfileModuleCard
          title="Ratings & reviews"
          icon={<IconStar className="h-5 w-5" />}
        >
          {hasReviews ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <StarRating
                  value={Math.round(pilot.averageRating!)}
                  size="md"
                />
                <div>
                  <p className="text-2xl font-bold text-gold-light">
                    {pilot.averageRating}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pilot.reviewCount} total review
                    {pilot.reviewCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              {latestReview ? (
                <div className="rounded-lg border border-border bg-surface/50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {latestReview.authorLabel}
                    </p>
                    <StarRating value={latestReview.rating} size="sm" />
                  </div>
                  {latestReview.comment ? (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {latestReview.comment}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <EmptyState message="No reviews yet." />
          )}
        </ProfileModuleCard>
      </div>

      {/* Recent reviews list */}
      {pilot.recentReviews.length > 1 ? (
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Recent reviews
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {pilot.recentReviews.slice(1).map((review) => (
              <li
                key={review.id}
                className="premium-card p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{review.authorLabel}</p>
                  <StarRating value={review.rating} size="sm" />
                </div>
                {review.comment ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {review.comment}
                  </p>
                ) : null}
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* CTA */}
      <section className="glass-card border-gold/25 px-6 py-8 text-center sm:px-10 sm:py-10">
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          Ready to hire {pilot.displayName}?
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Create a client account, post a job, and receive bids from verified
          pilots on the marketplace.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
          <Button href="/register">Hire via marketplace</Button>
          <Button href="/pilots" variant="secondary">
            Browse more pilots
          </Button>
        </div>
      </section>
    </div>
  );
}
