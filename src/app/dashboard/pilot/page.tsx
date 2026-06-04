import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  DashboardChip,
  DashboardDetailRow,
  DashboardEmptyState,
  DashboardHero,
  DashboardModuleCard,
  DashboardModulesGrid,
  DashboardPageLayout,
  DashboardStatsGrid,
  DashboardStatusBadge,
  DashboardStatusBanner,
  FeatureCard,
  IconCertificate,
  IconDollar,
  IconJobs,
  IconProfile,
  IconServices,
  IconShield,
  IconStar,
  IconWings,
  StatCard,
} from "@/components/dashboard";
import { StarRating } from "@/components/reviews/StarRating";
import { SubscriptionStatusBadge } from "@/components/subscriptions/SubscriptionStatusBadge";
import { Button } from "@/components/ui/Button";
import { getPilotDashboardOverview } from "@/lib/pilot/dashboard";
import { formatPilotLocation } from "@/lib/pilot/format";
import { getPilotMembershipSummary } from "@/lib/membership/membership";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import { getProfileStatusLabel } from "@/lib/pilot/status";
import { formatJobVisibilityDelay } from "@/lib/subscriptions/status";
import { getVerificationTypeLabel } from "@/lib/verification/status";
import type { PilotProfileStatus } from "@/types/pilot";
import type { SubscriptionStatus } from "@/types/subscription";
import type { VerificationType } from "@/types/verification";

export const metadata = { title: "Pilot Dashboard" };

type PageProps = {
  searchParams: Promise<{ onboarding?: string }>;
};

function profileApprovalHint(status: PilotProfileStatus): string {
  switch (status) {
    case "pending_review":
      return "Your profile is in the admin queue. Once approved, you can enroll in a membership tier and browse jobs.";
    case "rejected":
      return "Update your profile and complete onboarding again, then wait for admin approval.";
    case "suspended":
      return "Contact support — your account is suspended from marketplace activity.";
    case "draft":
      return "Finish onboarding and submit your profile for admin review.";
    default:
      return "An admin must approve your pilot profile before you can use Find Jobs and bidding.";
  }
}

export default async function PilotDashboardPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const params = await searchParams;
  const profile = await getPilotProfileByUserId(session.user.id);
  const onboardingComplete = isOnboardingComplete(profile);

  if (!onboardingComplete) {
    redirect("/dashboard/pilot/onboarding");
  }

  const status = (profile?.status ?? "draft") as PilotProfileStatus;
  const justCompleted = params.onboarding === "complete";
  const approved = status === "approved";
  const membership =
    approved && profile ? await getPilotMembershipSummary(profile.id) : null;

  const overview = await getPilotDashboardOverview(
    profile!.id,
    session.user.id,
    profile!,
    approved,
  );

  const location = formatPilotLocation(
    profile!.locationCity,
    profile!.locationRegion,
    profile!.locationCountry,
  );

  const heroFooter = (
    <>
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        Operations status
      </p>
      <div className="flex flex-wrap gap-2">
        <DashboardStatusBadge tone={approved ? "success" : "warning"}>
          {getProfileStatusLabel(status)}
        </DashboardStatusBadge>
        <DashboardChip>{overview.profileCompletionPct}% profile complete</DashboardChip>
        {membership ? (
          <DashboardChip>{membership.tier.code}</DashboardChip>
        ) : (
          <DashboardStatusBadge tone="neutral">No membership tier</DashboardStatusBadge>
        )}
        {overview.verifiedTypes.map((t) => (
          <DashboardStatusBadge key={t} tone="warning">
            Verified {getVerificationTypeLabel(t as VerificationType)}
          </DashboardStatusBadge>
        ))}
      </div>
    </>
  );

  return (
    <DashboardPageLayout>
      <DashboardHero
        eyebrow="Pilot operations"
        title={profile!.displayName}
        description={location}
        aside={
          overview.reviewCount > 0 && overview.averageRating != null ? (
            <div className="rounded-xl border border-gold/30 bg-gold/5 px-5 py-4 text-center lg:text-right">
              <StarRating
                value={Math.round(overview.averageRating)}
                size="md"
              />
              <p className="mt-2 text-2xl font-bold text-gold-light">
                {overview.averageRating}
              </p>
              <p className="text-xs text-muted-foreground">
                {overview.reviewCount} review
                {overview.reviewCount === 1 ? "" : "s"}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface/50 px-5 py-4 text-center lg:text-right">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Rating
              </p>
              <p className="mt-2 text-sm text-muted-foreground">No reviews yet</p>
            </div>
          )
        }
        footer={
          <>
            {heroFooter}
            <div className="mt-6 flex flex-wrap gap-3">
              {approved ? (
                <>
                  <Button href="/dashboard/pilot/jobs" size="sm">
                    Find jobs
                  </Button>
                  <Button
                    href="/dashboard/pilot/applications"
                    variant="secondary"
                    size="sm"
                  >
                    My applications
                  </Button>
                </>
              ) : (
                <Button href="/dashboard/pilot/profile" size="sm">
                  Complete profile
                </Button>
              )}
              <Button href="/dashboard/pilot/profile" variant="outline" size="sm">
                Edit profile
              </Button>
              {profile!.isPublic ? (
                <Button href={`/pilots/${profile!.id}`} variant="ghost" size="sm">
                  Public profile
                </Button>
              ) : null}
            </div>
          </>
        }
      />

      {justCompleted ? (
        <DashboardStatusBanner>
          Profile submitted. Status:{" "}
          <strong>{getProfileStatusLabel(status)}</strong>. You will be able to
          browse jobs after an admin approves your profile and you enroll in a
          membership tier.
        </DashboardStatusBanner>
      ) : null}

      {!approved ? (
        <DashboardStatusBanner variant="muted">
          {profileApprovalHint(status)} Demo tip: use{" "}
          <span className="font-mono text-foreground">pilot@dronepilot.local</span>{" "}
          for a pre-approved Captain account.
        </DashboardStatusBanner>
      ) : null}

      <DashboardStatsGrid>
        <StatCard
          label="Available jobs"
          value={approved ? String(overview.availableJobs) : "—"}
          icon={<IconJobs className="h-5 w-5" />}
          href={approved ? "/dashboard/pilot/jobs" : undefined}
        />
        <StatCard
          label="Active bookings"
          value={String(overview.activeBookings)}
          icon={<IconServices className="h-5 w-5" />}
          href="/dashboard/pilot/bookings"
        />
        <StatCard
          label="Submitted bids"
          value={String(overview.submittedBids)}
          icon={<IconProfile className="h-5 w-5" />}
          href="/dashboard/pilot/applications"
        />
        <StatCard
          label="Completed jobs"
          value={String(overview.completedBookings)}
          icon={<IconShield className="h-5 w-5" />}
          href="/dashboard/pilot/bookings"
        />
        <StatCard
          label="Demo payouts"
          value={`$${overview.demoEarningsUsd.toLocaleString()}`}
          icon={<IconDollar className="h-5 w-5" />}
          href="/dashboard/pilot/payments"
          helperText="Internal demo payments"
        />
        <StatCard
          label="Average rating"
          value={overview.averageRating != null ? String(overview.averageRating) : "—"}
          icon={<IconStar className="h-5 w-5" />}
          href="/dashboard/pilot/reviews"
        />
        <StatCard
          label="Digital wings"
          value={String(overview.wingsCount)}
          icon={<IconWings className="h-5 w-5" />}
          href="/dashboard/pilot/achievements"
        />
        <StatCard
          label="Certificates"
          value={String(overview.certificatesCount)}
          icon={<IconCertificate className="h-5 w-5" />}
          href="/dashboard/pilot/certificates"
        />
      </DashboardStatsGrid>

      <DashboardModulesGrid>
        <DashboardModuleCard
          title="Membership tier"
          icon={<IconShield className="h-5 w-5" />}
          action={
            <Button href="/dashboard/pilot/subscription" variant="ghost" size="sm">
              Manage
            </Button>
          }
        >
          {membership ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-lg border border-gold/45 bg-gold/15 px-4 py-2 font-mono text-lg font-bold text-gold-light">
                  {membership.tier.code}
                </span>
                <div>
                  <p className="font-semibold text-foreground">
                    {membership.tier.name}
                  </p>
                  <SubscriptionStatusBadge
                    status={membership.status as SubscriptionStatus}
                  />
                </div>
              </div>
              <dl className="dashboard-inner-surface px-4">
                <DashboardDetailRow
                  label="Job visibility"
                  value={formatJobVisibilityDelay(
                    membership.tier.jobVisibilityDelayHours,
                  )}
                />
                <DashboardDetailRow
                  label="Bidding"
                  value={
                    membership.tier.canApply ? "Enabled" : "View only (A-2+ to bid)"
                  }
                />
              </dl>
            </div>
          ) : (
            <DashboardEmptyState message="No active membership. Enroll in A-1 through A-6 to access the job board.">
              <Button href="/dashboard/pilot/subscription" size="sm">
                View tiers
              </Button>
            </DashboardEmptyState>
          )}
        </DashboardModuleCard>

        <DashboardModuleCard
          title="Job visibility"
          icon={<IconJobs className="h-5 w-5" />}
        >
          {approved && membership ? (
            <p className="text-sm text-muted-foreground">
              {membership.tier.jobVisibilityDelayHours === 0
                ? "Open jobs appear on your board immediately after client approval."
                : `Tier delay: ${formatJobVisibilityDelay(membership.tier.jobVisibilityDelayHours)}. Locked jobs unlock on your Find Jobs page.`}
            </p>
          ) : (
            <DashboardEmptyState message="Enroll in a tier and get profile approval to unlock job visibility rules." />
          )}
        </DashboardModuleCard>

        <DashboardModuleCard
          title="Verification"
          icon={<IconShield className="h-5 w-5" />}
          action={
            <Button href="/dashboard/pilot/verifications" variant="ghost" size="sm">
              Upload docs
            </Button>
          }
        >
          {overview.verifiedTypes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {overview.verifiedTypes.map((t) => (
                <DashboardStatusBadge key={t} tone="warning">
                  {getVerificationTypeLabel(t as VerificationType)}
                </DashboardStatusBadge>
              ))}
            </div>
          ) : (
            <DashboardEmptyState message="No approved verifications yet. Submit license or insurance documents for review." />
          )}
        </DashboardModuleCard>

        <FeatureCard
          title="Digital wings"
          description={`${overview.wingsCount} achievement${overview.wingsCount === 1 ? "" : "s"} earned on the platform.`}
          href="/dashboard/pilot/achievements"
          icon={<IconWings className="h-5 w-5" />}
          ctaLabel="View wings"
        />

        <FeatureCard
          title="Certificates"
          description={`${overview.certificatesCount} platform certificate${overview.certificatesCount === 1 ? "" : "s"} issued to your profile.`}
          href="/dashboard/pilot/certificates"
          icon={<IconCertificate className="h-5 w-5" />}
          ctaLabel="View certificates"
        />

        <FeatureCard
          title="Ratings & reviews"
          description={
            overview.reviewCount > 0
              ? `${overview.reviewCount} published review${overview.reviewCount === 1 ? "" : "s"} from completed missions.`
              : "Complete bookings to receive client ratings."
          }
          href="/dashboard/pilot/reviews"
          icon={<IconStar className="h-5 w-5" />}
          ctaLabel="View reviews"
        />

        <FeatureCard
          title="Uniform shop"
          description="Browse catalog and place uniform orders (demo checkout)."
          href="/dashboard/pilot/shop"
          icon={<IconServices className="h-5 w-5" />}
          ctaLabel="Open shop"
        />

        <FeatureCard
          title="Messages"
          description="Client threads linked to jobs, bids, and bookings."
          href="/dashboard/pilot/messages"
          icon={<IconProfile className="h-5 w-5" />}
          ctaLabel="Open inbox"
        />

        <FeatureCard
          title="Support"
          description="Use the Talk to Support bubble on any page for platform help."
          href="/contact"
          icon={<IconShield className="h-5 w-5" />}
          ctaLabel="Contact support"
        />
      </DashboardModulesGrid>

      {approved ? (
        <DashboardModulesGrid>
          <FeatureCard
            title="Find jobs"
            description="Browse open missions matching your tier visibility."
            href="/dashboard/pilot/jobs"
            icon={<IconJobs className="h-5 w-5" />}
          />
          <FeatureCard
            title="My applications"
            description="Track bids awaiting client decisions."
            href="/dashboard/pilot/applications"
            icon={<IconServices className="h-5 w-5" />}
          />
          <FeatureCard
            title="My bookings"
            description="Manage active and completed work."
            href="/dashboard/pilot/bookings"
            icon={<IconJobs className="h-5 w-5" />}
          />
          <FeatureCard
            title="Payments"
            description="Demo payout history for completed bookings."
            href="/dashboard/pilot/payments"
            icon={<IconDollar className="h-5 w-5" />}
          />
        </DashboardModulesGrid>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href={profile!.isPublic ? `/pilots/${profile!.id}` : "/dashboard/pilot/profile"}
          className="font-medium text-gold-light hover:text-gold"
        >
          {profile!.isPublic ? "View public pilot profile →" : "Enable public profile →"}
        </Link>
      </p>
    </DashboardPageLayout>
  );
}
