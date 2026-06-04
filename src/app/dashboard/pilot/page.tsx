import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  ActionCard,
  DashboardEmptyState,
  DashboardHero,
  DashboardModuleCard,
  DashboardPageLayout,
  DashboardStatusBanner,
  IconJobs,
  IconProfile,
  IconServices,
  IconShield,
  StatCard,
} from "@/components/dashboard";
import { Button } from "@/components/ui/Button";
import { getPilotMembershipSummary } from "@/lib/membership/membership";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
  parseServicesOffered,
} from "@/lib/pilot/profile";
import { getProfileStatusLabel } from "@/lib/pilot/status";
import type { PilotProfileStatus } from "@/types/pilot";

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
  const membership = approved && profile
    ? await getPilotMembershipSummary(profile.id)
    : null;

  const location =
    [profile?.locationCity, profile?.locationRegion, profile?.locationCountry]
      .filter(Boolean)
      .join(", ") || "Location not set";
  const serviceCount = profile
    ? parseServicesOffered(profile.servicesOffered).length
    : 0;

  return (
    <DashboardPageLayout>
      <DashboardHero
        eyebrow="Pilot dashboard"
        title={`Welcome${profile?.displayName ? `, ${profile.displayName}` : ""}`}
        description="Mission control for jobs, applications, bookings, and your public pilot profile."
        aside={
          <div className="rounded-xl border border-gold/30 bg-gold/5 px-5 py-4 text-center lg:text-right">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Profile status
            </p>
            <p className="mt-2 text-lg font-bold text-gold-light">
              {getProfileStatusLabel(status)}
            </p>
            <Button
              href="/dashboard/pilot/profile"
              variant="ghost"
              size="sm"
              className="mt-3"
            >
              Edit profile
            </Button>
          </div>
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

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <StatCard
          label="Profile status"
          value={getProfileStatusLabel(status)}
          icon={<IconProfile className="h-5 w-5" />}
        />
        <StatCard
          label="Service types"
          value={String(serviceCount)}
          icon={<IconServices className="h-5 w-5" />}
          helperText={serviceCount === 1 ? "1 listed" : `${serviceCount} listed`}
        />
        <StatCard
          label="Base location"
          value=""
          icon={<IconShield className="h-5 w-5" />}
          className="sm:col-span-2"
        >
          <p className="text-sm text-muted-foreground">{location}</p>
        </StatCard>
      </div>

      {!approved ? (
        <DashboardModuleCard
          title="Jobs & bidding"
          icon={<IconJobs className="h-5 w-5" />}
        >
          <DashboardEmptyState
            title="Jobs & bidding locked"
            message={profileApprovalHint(status)}
          >
            <Button href="/dashboard/pilot/profile" variant="outline" size="sm">
              Review profile
            </Button>
          </DashboardEmptyState>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo tip: sign in as{" "}
            <span className="font-mono">pilot@dronepilot.local</span> (pre-approved
            Captain) or ask an admin to approve your profile under Admin → Pilots.
          </p>
        </DashboardModuleCard>
      ) : (
        <>
          {membership ? (
            <DashboardStatusBanner>
              <strong>{membership.tier.name}</strong> membership ·{" "}
              {membership.tier.jobVisibilityDelayHours === 0
                ? "jobs visible immediately after approval"
                : `jobs visible ${membership.tier.jobVisibilityDelayHours}h after admin approval`}
              {membership.tier.canApply
                ? " · bidding enabled"
                : " · view-only (upgrade to A-2+ to bid)"}
            </DashboardStatusBanner>
          ) : (
            <DashboardModuleCard
              title="Membership tier"
              icon={<IconShield className="h-5 w-5" />}
            >
              <p className="text-sm text-muted-foreground">
                No active membership tier.{" "}
                <Link
                  href="/dashboard/pilot/subscription"
                  className="font-medium text-gold-light hover:text-gold"
                >
                  Enroll in A-1 through A-6 →
                </Link>
              </p>
            </DashboardModuleCard>
          )}

          <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
            <ActionCard
              title="Find jobs"
              description="Browse open jobs (visibility depends on your tier)."
              href="/dashboard/pilot/jobs"
              icon={<IconJobs className="h-5 w-5" />}
            />
            <ActionCard
              title="My applications"
              description="Track submitted bids and their status."
              href="/dashboard/pilot/applications"
              icon={<IconServices className="h-5 w-5" />}
            />
            <ActionCard
              title="My jobs (bookings)"
              description="Manage confirmed work after a client accepts your bid."
              href="/dashboard/pilot/bookings"
              icon={<IconJobs className="h-5 w-5" />}
            />
            <ActionCard
              title="Reviews"
              description="See ratings from completed missions."
              href="/dashboard/pilot/reviews"
              icon={<IconProfile className="h-5 w-5" />}
            />
            <ActionCard
              title="Membership tier"
              description="View or change your A-1 through A-6 marketplace membership."
              href="/dashboard/pilot/subscription"
              icon={<IconShield className="h-5 w-5" />}
              className="md:col-span-2"
            />
          </div>
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/dashboard/pilot/profile"
          className="font-medium text-gold-light hover:text-gold"
        >
          View full profile →
        </Link>
      </p>
    </DashboardPageLayout>
  );
}
