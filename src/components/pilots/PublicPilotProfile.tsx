import Link from "next/link";
import { MembershipRankBadge } from "@/components/membership/MembershipRankBadge";
import { StarRating } from "@/components/reviews/StarRating";
import { SubscriptionStatusBadge } from "@/components/subscriptions/SubscriptionStatusBadge";
import { Button } from "@/components/ui/Button";
import { formatDisplayDateShort } from "@/lib/format/date";
import {
  getDisplayCodeForTier,
  getRankImageForTierCode,
} from "@/lib/membership/rank-assets";
import { formatJobVisibilityDelay } from "@/lib/subscriptions/status";
import {
  formatPilotLocation,
  formatPilotRateRange,
  formatServiceRadius,
} from "@/lib/pilot/format";
import { WingBadge } from "@/components/wings/WingBadge";
import { cn } from "@/lib/utils";
import type { PublicPilotProfileDto } from "@/types/public-pilot";

function IconChat({ className }: { className?: string }) {
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
        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
      />
    </svg>
  );
}

function DollarSignIcon({ className }: { className?: string }) {
  return (
    <span className={cn("figma-pilot-dollar-sign", className)} aria-hidden>
      $
    </span>
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

function IconPin({ className }: { className?: string }) {
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
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function formatRatingScore(rating: number): string {
  return String(Math.round(rating)).padStart(2, "0");
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
        "figma-pilot-module-card flex h-full flex-col p-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-[rgba(42,42,42,0.8)] pb-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.875rem] border border-[rgba(216,179,57,0.35)] bg-[rgba(216,179,57,0.1)] text-gold">
          {icon}
        </span>
        <h2 className="text-base font-semibold text-ras-text">{title}</h2>
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
        "figma-pilot-module-card figma-pilot-stat-card flex h-full flex-col p-6",
        className,
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-[0.875rem] border border-[rgba(216,179,57,0.35)] bg-[rgba(216,179,57,0.1)] text-gold">
        {icon}
      </span>
      <p className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-ras-muted">
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

function EmptyInline({ message }: { message: string }) {
  return <p className="figma-pilot-empty-inline">{message}</p>;
}

/** Figma hero aside: insignia + stacked A-6 / Captain */
function HeroRankPill({
  tierCode,
  tierName,
}: {
  tierCode: string;
  tierName: string;
}) {
  const rankImage = getRankImageForTierCode(tierCode);
  const displayCode = getDisplayCodeForTier(tierCode);
  const gradeName = tierName.replace(/^A-\d+\s+/i, "").trim() || tierName;

  return (
    <div
      className="figma-pilot-rank-pill"
      title={`${displayCode} ${gradeName}`}
    >
      {rankImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={rankImage}
          alt=""
          className="figma-pilot-rank-pill-mark"
        />
      ) : null}
      <div className="figma-pilot-rank-pill-text">
        <span className="figma-pilot-rank-pill-code">{displayCode}</span>
        <span className="figma-pilot-rank-pill-name">{gradeName}</span>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-3 last:border-0">
      <dt className="text-sm text-ras-muted">{label}</dt>
      <dd className="text-right text-sm font-medium text-ras-text">{value}</dd>
    </div>
  );
}

function ServiceChip({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full border border-[rgba(216,179,57,0.4)] bg-[rgba(216,179,57,0.12)] px-3 py-1 text-xs font-medium text-gold-light">
      {label}
    </span>
  );
}

function CredentialChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[rgba(216,179,57,0.35)] bg-[rgba(216,179,57,0.12)] px-2.5 py-0.5 text-xs font-medium leading-none text-gold-light">
      {label}
    </span>
  );
}

export function PublicPilotProfile({
  pilot,
  messageHref = "/register?role=client",
  hireHref = "/register?role=client",
}: {
  pilot: PublicPilotProfileDto;
  messageHref?: string;
  hireHref?: string;
}) {
  const location = formatPilotLocation(
    pilot.locationCity,
    pilot.locationRegion,
    pilot.locationCountry,
  );
  const rate =
    formatPilotRateRange(pilot.hourlyRateMin, pilot.hourlyRateMax) ?? "—";
  const hasBadges =
    pilot.wings.length > 0 ||
    pilot.approvedCredentials.length > 0 ||
    pilot.certificates.length > 0;
  const hasReviews = pilot.reviewCount > 0 && pilot.averageRating != null;
  const latestReview = pilot.recentReviews[0];
  const galleryReviews = pilot.recentReviews.slice(latestReview ? 1 : 0);
  const initials = initialsFromName(pilot.displayName);

  return (
    <div className="figma-pilot-public">
      {/* Hero — Figma 1604:2258 */}
      <article className="figma-pilot-public-hero relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(140.6deg, rgba(28,28,28,0.98) 0%, rgba(24,24,24,0.99) 50%, rgb(19,19,19) 100%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_100%_0%,rgba(201,162,39,0.12),transparent_55%)]"
          aria-hidden
        />

        <div className="figma-pilot-public-hero-grid relative">
          <div className="figma-pilot-public-photo shrink-0">
            {pilot.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pilot.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[rgba(216,179,57,0.08)] text-4xl font-bold tracking-wide text-gold">
                {initials}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d8b339]">
              {pilot.instructorListed
                ? "Remote Pilot Instructor"
                : "Licensed pilot"}
            </p>
            <h1 className="mt-2 text-[2.25rem] font-bold leading-10 tracking-[-0.025em] text-ras-text">
              {pilot.displayName}
            </h1>
            {pilot.callSign ? (
              <p className="mt-1 text-sm font-medium uppercase tracking-[0.16em] text-[#d8b339]">
                {pilot.callSign}
              </p>
            ) : null}
            {pilot.licenseCountry ? (
              <p className="mt-2 text-sm text-ras-dim-alt">
                Licensed in {pilot.licenseCountry}
              </p>
            ) : null}
            <p className="mt-3 flex items-center gap-2 text-base text-ras-dim-alt">
              <IconPin className="h-4 w-4 shrink-0 text-gold" />
              {location}
            </p>
            {pilot.bio ? (
              <p className="mt-5 max-w-[26rem] text-base leading-relaxed text-ras-muted">
                {pilot.bio}
              </p>
            ) : null}
            {pilot.languages.length > 0 ? (
              <p className="mt-3 text-sm text-ras-dim-alt">
                Languages: {pilot.languages.join(" · ")}
              </p>
            ) : null}

            {hasBadges ? (
              <div className="mt-8">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ras-dim-alt">
                  Digital wings &amp; verifications
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {pilot.wings.map((w) => (
                    <WingBadge
                      key={w.code}
                      title={w.title}
                      iconLabel={w.iconLabel}
                      imageUrl={w.imageUrl}
                      category={w.category}
                      size="sm"
                    />
                  ))}
                  {pilot.approvedCredentials.map((c) => (
                    <CredentialChip key={c.catalogId} label={c.title} />
                  ))}
                  {pilot.certificates.map((cert) => (
                    <CredentialChip
                      key={cert.id}
                      label={cert.templateName}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="figma-pilot-hero-aside">
            {pilot.highestWing ? (
              <div className="flex flex-col items-start text-left">
                {pilot.highestWing.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pilot.highestWing.imageUrl}
                    alt=""
                    className="h-8 w-24 object-contain object-left"
                  />
                ) : (
                  <WingBadge
                    title={pilot.highestWing.title}
                    iconLabel={pilot.highestWing.iconLabel}
                    imageUrl={pilot.highestWing.imageUrl}
                    category={pilot.highestWing.category}
                    size="sm"
                  />
                )}
                <p className="mt-2 text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-[#d8b339]">
                  Highest wing
                </p>
                <p className="mt-1 text-xs font-semibold leading-snug text-ras-text">
                  {pilot.highestWing.title}
                </p>
              </div>
            ) : null}

            {hasReviews ? (
              <div className="figma-pilot-hero-rating">
                <span className="text-[2.5rem] font-bold leading-8 text-[#e4c55a]">
                  {formatRatingScore(pilot.averageRating!)}
                </span>
                <div className="figma-pilot-hero-rating-stars">
                  <StarRating
                    value={Math.round(pilot.averageRating!)}
                    size="sm"
                  />
                  <p className="text-xs text-[#a3a3a3]">
                    {pilot.reviewCount} review
                    {pilot.reviewCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            ) : null}

            {pilot.membership ? (
              <HeroRankPill
                tierCode={pilot.membership.tierCode}
                tierName={pilot.membership.tierName}
              />
            ) : null}
          </aside>

          <div className="figma-pilot-public-actions">
            <Link
              href={messageHref}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.875rem] border border-[rgba(216,179,57,0.35)] bg-[rgba(216,179,57,0.08)] text-gold transition-colors hover:border-gold/55 hover:bg-[rgba(216,179,57,0.14)] hover:text-gold-light"
              aria-label={`Message ${pilot.displayName}`}
              title="Message pilot"
            >
              <IconChat className="h-5 w-5" />
            </Link>
            <Button
              href={hireHref}
              className="h-11 min-w-44 flex-1 rounded-[0.875rem] sm:flex-none"
            >
              Hire via marketplace
            </Button>
            <Button
              href="/pilots"
              variant="secondary"
              className="h-11 min-w-44 flex-1 rounded-[0.875rem] border-[rgba(216,179,57,0.45)] sm:flex-none"
            >
              Browse more pilots
            </Button>
          </div>
        </div>
      </article>

      {/* Metrics — Figma 4-col, services spans 2 */}
      <div className="figma-pilot-metrics">
        <StatCard
          label="Hourly rate"
          value={rate}
          icon={<DollarSignIcon />}
        />
        <StatCard
          label="Service radius"
          value={formatServiceRadius(pilot.serviceRadiusKm) ?? "—"}
          icon={<IconRadius className="h-5 w-5" />}
        />
        <StatCard
          label="Services"
          value=""
          icon={<IconServices className="h-5 w-5" />}
          className="figma-pilot-metrics-services"
        >
          {pilot.serviceLabels.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {pilot.serviceLabels.map((label) => (
                <ServiceChip key={label} label={label} />
              ))}
            </div>
          ) : (
            <EmptyInline message="No services listed." />
          )}
        </StatCard>
      </div>

      {/* Mid grid — Figma: Certs|Ratings, then Drones+Payloads|Membership */}
      <div className="figma-pilot-mid-grid">
        <ProfileModuleCard
          className="figma-pilot-mid-certs"
          title="Certificates"
          icon={<IconCertificate className="h-5 w-5" />}
        >
          {pilot.certificates.length > 0 ? (
            <ul className="figma-pilot-cert-grid">
              {pilot.certificates.map((cert) => (
                <li
                  key={cert.id}
                  className="rounded-[0.875rem] border border-[#2a2a2a] bg-[rgba(26,26,26,0.5)] px-4 py-3"
                >
                  <p className="font-medium text-ras-text">
                    {cert.templateName}
                  </p>
                  <p className="mt-1 font-mono text-xs text-gold-light">
                    {cert.certificateNumber}
                  </p>
                  <p className="mt-2 text-xs text-ras-muted">
                    Issued {formatDisplayDateShort(cert.issuedAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyInline message="No certificates issued yet." />
          )}
        </ProfileModuleCard>

        <ProfileModuleCard
          className="figma-pilot-mid-ratings"
          title="Ratings & reviews"
          icon={<IconStar className="h-5 w-5" />}
        >
          {hasReviews ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-4xl font-bold text-gold-light">
                  {Math.round(pilot.averageRating!)}
                </p>
                <div>
                  <StarRating
                    value={Math.round(pilot.averageRating!)}
                    size="md"
                  />
                  <p className="mt-1 text-sm text-ras-muted">
                    {pilot.reviewCount} total review
                    {pilot.reviewCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              {latestReview ? (
                <div className="rounded-[0.875rem] border border-border bg-surface/50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ras-text">
                      {latestReview.authorLabel}
                    </p>
                    <StarRating value={latestReview.rating} size="sm" />
                  </div>
                  {latestReview.comment ? (
                    <p className="mt-2 line-clamp-3 text-sm text-ras-muted">
                      {latestReview.comment}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <EmptyInline message="No reviews yet." />
          )}
        </ProfileModuleCard>

        <div className="figma-pilot-mid-equipment">
          <ProfileModuleCard
            title="Main drones"
            icon={<IconServices className="h-5 w-5" />}
          >
            {pilot.mainDrones.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {pilot.mainDrones.map((drone) => (
                  <ServiceChip key={drone} label={drone} />
                ))}
              </div>
            ) : (
              <EmptyInline message="No drones listed." />
            )}
          </ProfileModuleCard>

          <ProfileModuleCard
            title="Payloads"
            icon={<IconServices className="h-5 w-5" />}
          >
            {pilot.payloads.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {pilot.payloads.map((item) => (
                  <ServiceChip key={item} label={item} />
                ))}
              </div>
            ) : (
              <EmptyInline message="No payloads listed." />
            )}
          </ProfileModuleCard>
        </div>

        <ProfileModuleCard
          className="figma-pilot-mid-membership"
          title="Membership tier"
          icon={<IconTier className="h-5 w-5" />}
        >
          {pilot.membership ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <MembershipRankBadge
                  tierCode={pilot.membership.tierCode}
                  tierName={pilot.membership.tierName}
                  size="md"
                />
                <SubscriptionStatusBadge status={pilot.membership.status} />
              </div>
              <dl className="rounded-[0.875rem] border border-border bg-surface/50 px-4">
                <DetailRow
                  label="Job visibility"
                  value={formatJobVisibilityDelay(
                    pilot.membership.jobVisibilityDelayHours,
                  )}
                />
                <DetailRow
                  label="Bidding"
                  value={
                    pilot.membership.canApply
                      ? "Can submit bids"
                      : "View only"
                  }
                />
                <DetailRow
                  label="Job board"
                  value={
                    pilot.membership.canViewJobs
                      ? "Can browse jobs"
                      : "No job board access"
                  }
                />
                <DetailRow
                  label="Instructor"
                  value={
                    pilot.instructorListed
                      ? "Listed as Remote Pilot Instructor"
                      : pilot.membership.instructorEligible
                        ? "Eligible"
                        : "Not eligible"
                  }
                />
              </dl>
            </div>
          ) : (
            <EmptyInline message="No active membership tier." />
          )}
        </ProfileModuleCard>
      </div>

      {/* Flight gallery */}
      <section>
        <h2 className="text-lg font-semibold text-ras-text">Flight gallery</h2>
        {pilot.portfolio.length > 0 ? (
          <ul className="figma-pilot-gallery-grid mt-4">
            {pilot.portfolio.map((item) => (
              <li
                key={item.id}
                className="figma-pilot-module-card figma-pilot-gallery-card p-0"
              >
                {item.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="h-[9.5rem] w-full object-cover"
                  />
                ) : (
                  <div className="figma-pilot-gallery-media">
                    <span>{item.type}</span>
                  </div>
                )}
                <div className="p-4">
                  <p className="font-medium text-ras-text">{item.title}</p>
                  {item.tags.length > 0 ? (
                    <p className="mt-1 text-xs uppercase tracking-[0.08em] text-ras-muted">
                      {item.tags.join(" · ")}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="figma-pilot-empty-inline mt-4">
            No flight gallery items yet.
          </p>
        )}
      </section>

      {/* Recent reviews */}
      {galleryReviews.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-ras-text">
            Recent reviews
          </h2>
          <ul className="figma-pilot-reviews-grid mt-4">
            {galleryReviews.map((review) => (
              <li key={review.id} className="figma-pilot-module-card p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ras-text">
                    {review.authorLabel}
                  </p>
                  <StarRating value={review.rating} size="sm" />
                </div>
                {review.comment ? (
                  <p className="mt-2 text-sm leading-relaxed text-ras-muted">
                    {review.comment}
                  </p>
                ) : null}
                <p className="mt-3 text-xs text-ras-muted">
                  {formatDisplayDateShort(review.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* CTA */}
      <section className="figma-pilot-module-card border-[rgba(216,179,57,0.25)] px-6 py-8 text-center sm:px-10 sm:py-10">
        <h2 className="text-xl font-semibold text-ras-text sm:text-2xl">
          Ready to hire {pilot.displayName}?
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-ras-muted">
          Create a client account, post a job, and receive bids from verified
          pilots on the marketplace.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
          <Button href={hireHref} className="rounded-[0.875rem]">
            Hire via marketplace
          </Button>
          <Button
            href="/pilots"
            variant="secondary"
            className="rounded-[0.875rem] border-[rgba(216,179,57,0.45)]"
          >
            Browse more pilots
          </Button>
        </div>
      </section>
    </div>
  );
}
