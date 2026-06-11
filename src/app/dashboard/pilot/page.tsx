import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotDashboardOverview } from "@/components/dashboard/pilot/PilotDashboardOverview";
import { DashboardPageLayout, DashboardStatusBanner } from "@/components/dashboard";
import { getPilotDashboardPageData } from "@/lib/pilot/dashboard-page-data";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import { getProfileStatusLabel } from "@/lib/pilot/status";
import type { PilotProfileStatus } from "@/types/pilot";
import "@/styles/pilot-dashboard.css";

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

  if (!onboardingComplete || !profile) {
    redirect("/dashboard/pilot/onboarding");
  }

  const status = profile.status as PilotProfileStatus;
  const justCompleted = params.onboarding === "complete";
  const approved = status === "approved";

  const pageData = await getPilotDashboardPageData(
    profile.id,
    session.user.id,
    profile,
    approved,
  );

  return (
    <DashboardPageLayout className="pilot-dashboard-shell">
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

      <PilotDashboardOverview data={pageData} />
    </DashboardPageLayout>
  );
}
