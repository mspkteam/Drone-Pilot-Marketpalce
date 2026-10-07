import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { OnboardingRedirect } from "@/components/pilot/OnboardingRedirect";
import {
  buildDashboardUser,
  buildPilotRankCard,
} from "@/lib/dashboard/shell-user";
import { getMilestoneShellProps } from "@/lib/milestone-shell-props";
import { getPilotMembershipSummary } from "@/lib/membership/membership";
import { pilotNavGroups } from "@/lib/navigation/dashboard-pilot";
import { computePilotGradeProgressPct } from "@/lib/pilot/pilot-profile-strength";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import { parseProfileExtrasJson } from "@/lib/pilot/profile-extras";
import { prisma } from "@/lib/db";

export default async function PilotDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let needsOnboarding = false;
  let user = buildDashboardUser(session?.user ?? {}, {
    roleSubtitle: "Pilot account",
  });
  let rankCard = buildPilotRankCard({
    displayName: "Pilot",
    tierCode: "A1_STUDENT",
    progressPct: 0,
  });

  if (session?.user?.id && session.user.role === "pilot") {
    const profile = await getPilotProfileByUserId(session.user.id);
    needsOnboarding = !isOnboardingComplete(profile);

    if (profile) {
      user = buildDashboardUser(session.user, {
        displayName: profile.displayName,
        roleSubtitle: "Pilot account",
        avatarUrl: parseProfileExtrasJson(profile.profileExtrasJson).avatarUrl,
      });

      const [membership, insuranceApproved] = await Promise.all([
        getPilotMembershipSummary(profile.id),
        prisma.verification.findFirst({
          where: {
            pilotProfileId: profile.id,
            type: "insurance",
            status: "approved",
          },
          select: { id: true },
        }),
      ]);

      rankCard = buildPilotRankCard({
        displayName: profile.displayName,
        tierCode: membership?.tier.code ?? "A1_STUDENT",
        progressPct: computePilotGradeProgressPct({
          bio: profile.bio,
          servicesOffered: profile.servicesOffered,
          portfolioJson: profile.portfolioJson,
          profileExtrasJson: profile.profileExtrasJson,
          insuranceVerified: Boolean(insuranceApproved),
        }),
      });
    }
  }

  const milestone = getMilestoneShellProps(
    session?.user?.role === "pilot" ? "pilot" : undefined,
  );

  return (
    <DashboardShell
      homeHref="/dashboard/pilot"
      navGroups={pilotNavGroups}
      user={user}
      rankCard={rankCard}
      {...milestone}
    >
      <OnboardingRedirect needsOnboarding={needsOnboarding} />
      {children}
    </DashboardShell>
  );
}
