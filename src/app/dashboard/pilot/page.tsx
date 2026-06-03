import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/PageHeader";
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

  return (
    <>
      <PageHeader
        badge="Pilot"
        title={`Welcome${profile?.displayName ? `, ${profile.displayName}` : ""}`}
        description="Your mission control — jobs, applications, and bookings at a glance."
      />

      <div className="mt-8 space-y-6">
        {justCompleted ? (
          <p
            className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-dark"
            role="status"
          >
            Profile submitted. Status:{" "}
            <strong>{getProfileStatusLabel(status)}</strong>. You will be able
            to browse jobs after an admin approves your profile and you enroll
            in a membership tier.
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="premium-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Profile status
            </p>
            <p className="mt-2 text-lg font-semibold">
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
          <div className="premium-card p-4 sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Services
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {profile
                ? parseServicesOffered(profile.servicesOffered).length
                : 0}{" "}
              service types listed ·{" "}
              {[profile?.locationCity, profile?.locationRegion, profile?.locationCountry]
                .filter(Boolean)
                .join(", ") || "Location not set"}
            </p>
          </div>
        </div>

        {!approved ? (
          <div className="rounded-lg border border-dashed border-border bg-surface/50 p-8 text-center">
            <h2 className="text-lg font-medium">Jobs & bidding locked</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {profileApprovalHint(status)}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Current status:{" "}
              <strong>{getProfileStatusLabel(status)}</strong>
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button href="/dashboard/pilot/profile" variant="outline" size="sm">
                Review profile
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Demo tip: sign in as{" "}
              <span className="font-mono">pilot@dronepilot.local</span> (pre-approved
              Captain) or ask an admin to approve your profile under Admin → Pilots.
            </p>
          </div>
        ) : (
          <>
            {membership ? (
              <div className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm">
                <strong>{membership.tier.name}</strong> membership ·{" "}
                {membership.tier.jobVisibilityDelayHours === 0
                  ? "jobs visible immediately after approval"
                  : `jobs visible ${membership.tier.jobVisibilityDelayHours}h after admin approval`}
                {membership.tier.canApply
                  ? " · bidding enabled"
                  : " · view-only (upgrade to A-2+ to bid)"}
              </div>
            ) : (
              <div className="premium-card px-4 py-3 text-sm text-muted-foreground">
                No active membership tier.{" "}
                <Link
                  href="/dashboard/pilot/subscription"
                  className="font-medium text-gold-dark hover:text-gold"
                >
                  Enroll in A-1 through A-6 →
                </Link>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/dashboard/pilot/jobs"
                className="premium-card p-6 transition-colors hover:border-gold/40"
              >
                <p className="font-semibold">Find jobs</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Browse open jobs (visibility depends on your tier).
                </p>
              </Link>
              <Link
                href="/dashboard/pilot/applications"
                className="premium-card p-6 transition-colors hover:border-gold/40"
              >
                <p className="font-semibold">My applications</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Track submitted bids and their status.
                </p>
              </Link>
              <Link
                href="/dashboard/pilot/bookings"
                className="premium-card p-6 transition-colors hover:border-gold/40"
              >
                <p className="font-semibold">My jobs (bookings)</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Manage confirmed work after a client accepts your bid.
                </p>
              </Link>
              <Link
                href="/dashboard/pilot/reviews"
                className="premium-card p-6 transition-colors hover:border-gold/40"
              >
                <p className="font-semibold">Reviews</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  See ratings from completed missions.
                </p>
              </Link>
              <Link
                href="/dashboard/pilot/subscription"
                className="premium-card p-6 transition-colors hover:border-gold/40 sm:col-span-2"
              >
                <p className="font-semibold">Membership tier</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  View or change your A-1 through A-6 marketplace membership.
                </p>
              </Link>
            </div>
          </>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/dashboard/pilot/profile" className="text-gold-dark hover:text-gold">
            View full profile →
          </Link>
        </p>
      </div>
    </>
  );
}
