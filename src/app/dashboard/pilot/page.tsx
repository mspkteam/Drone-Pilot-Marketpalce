import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlaceholderCard } from "@/components/layout/PlaceholderCard";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
  parseServicesOffered,
} from "@/lib/pilot/profile";
import { getProfileStatusLabel } from "@/lib/pilot/status";
import type { PilotProfileStatus } from "@/types/pilot";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Pilot Dashboard" };

type PageProps = {
  searchParams: Promise<{ onboarding?: string }>;
};

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
            to bid on jobs once an admin approves your profile.
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface-elevated p-4">
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
          <div className="rounded-lg border border-border bg-surface-elevated p-4 sm:col-span-2">
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

        {status !== "approved" ? (
          <PlaceholderCard
            title="Jobs & bidding locked"
            description="Complete profile approval before browsing and bidding on client jobs."
            moduleId="M08"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/dashboard/pilot/jobs"
              className="rounded-lg border border-border bg-surface-elevated p-6 transition-colors hover:border-gold/40"
            >
              <p className="font-semibold">Find jobs</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Browse open jobs and submit your bid.
              </p>
            </Link>
            <Link
              href="/dashboard/pilot/applications"
              className="rounded-lg border border-border bg-surface-elevated p-6 transition-colors hover:border-gold/40"
            >
              <p className="font-semibold">My applications</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Track submitted bids and their status.
              </p>
            </Link>
            <Link
              href="/dashboard/pilot/bookings"
              className="rounded-lg border border-border bg-surface-elevated p-6 transition-colors hover:border-gold/40"
            >
              <p className="font-semibold">My jobs (bookings)</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage confirmed work after a client accepts your bid.
              </p>
            </Link>
            <Link
              href="/dashboard/pilot/reviews"
              className="rounded-lg border border-border bg-surface-elevated p-6 transition-colors hover:border-gold/40"
            >
              <p className="font-semibold">Reviews</p>
              <p className="mt-2 text-sm text-muted-foreground">
                See ratings from completed missions.
              </p>
            </Link>
            <Link
              href="/dashboard/pilot/subscription"
              className="rounded-lg border border-border bg-surface-elevated p-6 transition-colors hover:border-gold/40 sm:col-span-2"
            >
              <p className="font-semibold">Subscription</p>
              <p className="mt-2 text-sm text-muted-foreground">
                View or change your pilot marketplace plan.
              </p>
            </Link>
          </div>
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
