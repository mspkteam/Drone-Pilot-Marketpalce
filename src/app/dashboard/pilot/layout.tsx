import { Suspense } from "react";
import { auth } from "@/auth";
import { TestInstantDeleteWatcher } from "@/components/account/TestInstantDeleteWatcher";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { OnboardingRedirect } from "@/components/pilot/OnboardingRedirect";
import {
  buildDashboardUser,
  buildPilotRankCard,
} from "@/lib/dashboard/shell-user";
import { getMilestoneShellProps } from "@/lib/milestone-shell-props";
import { getPilotMembershipSummary } from "@/lib/membership/membership";
import { buildPilotNavGroups } from "@/lib/navigation/dashboard-pilot";
import { computeRankProgressPct } from "@/lib/pilot/rank-progress";
import {
  ensurePilotDraftProfile,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import { parseProfileExtrasJson } from "@/lib/pilot/profile-extras";
import { membershipTierRank } from "@/lib/wings/conditions";

export default async function PilotDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let needsOnboarding = false;
  let instructorActive = false;
  let squadronVotingEligible = false;
  let user = buildDashboardUser(session?.user ?? {}, {
    roleSubtitle: "Pilot account",
  });
  let rankCard = buildPilotRankCard({
    displayName: "Pilot",
    tierCode: "A1_STUDENT",
    progressPct: 0,
  });

  if (session?.user?.id && session.user.role === "pilot") {
    // Draft row so Portfolio / Verification work before submit-for-review.
    const profile = await ensurePilotDraftProfile(session.user.id);
    needsOnboarding = !isOnboardingComplete(profile);

    instructorActive = Boolean(profile.instructorAddonActive);
    user = buildDashboardUser(session.user, {
      displayName:
        profile.displayName === "New Pilot"
          ? (session.user.email?.split("@")[0] ?? "Pilot")
          : profile.displayName,
      roleSubtitle: "Pilot account",
      avatarUrl: parseProfileExtrasJson(profile.profileExtrasJson).avatarUrl,
    });

    const membership = await getPilotMembershipSummary(profile.id);
    squadronVotingEligible =
      membershipTierRank(membership?.tier.code) >= 4;

    rankCard = buildPilotRankCard({
      displayName: user.displayName,
      tierCode: membership?.tier.code ?? "A1_STUDENT",
      progressPct: computeRankProgressPct({
        currentPeriodStart: membership?.currentPeriodStart ?? null,
        currentPeriodEnd: membership?.currentPeriodEnd ?? null,
      }),
    });
  }

  const milestone = getMilestoneShellProps(
    session?.user?.role === "pilot" ? "pilot" : undefined,
  );

  return (
    <DashboardShell
      homeHref="/dashboard/pilot"
      navGroups={buildPilotNavGroups({
        instructorActive,
        squadronVotingEligible,
        onboardingComplete: true,
      })}
      user={user}
      rankCard={rankCard}
      {...milestone}
    >
      <Suspense fallback={null}>
        <TestInstantDeleteWatcher />
      </Suspense>
      <OnboardingRedirect needsOnboarding={needsOnboarding} />
      {children}
    </DashboardShell>
  );
}
