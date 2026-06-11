import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { OnboardingRedirect } from "@/components/pilot/OnboardingRedirect";
import {
  buildDashboardUser,
  buildPilotRankCard,
} from "@/lib/dashboard/shell-user";
import { getPilotMembershipSummary } from "@/lib/membership/membership";
import { pilotNavGroups } from "@/lib/navigation/dashboard-pilot";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";

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
  let rankCard = buildPilotRankCard({ displayName: "Pilot" });

  if (session?.user?.id && session.user.role === "pilot") {
    const profile = await getPilotProfileByUserId(session.user.id);
    needsOnboarding = !isOnboardingComplete(profile);

    if (profile) {
      user = buildDashboardUser(session.user, {
        displayName: profile.displayName,
        roleSubtitle: "Pilot account",
      });

      const membership =
        profile.status === "approved"
          ? await getPilotMembershipSummary(profile.id)
          : null;

      rankCard = buildPilotRankCard({
        displayName: profile.displayName,
        tierCode: membership?.tier.code,
        progressPct: 62,
      });
    }
  }

  return (
    <DashboardShell
      homeHref="/dashboard/pilot"
      navGroups={pilotNavGroups}
      user={user}
      rankCard={rankCard}
    >
      <OnboardingRedirect needsOnboarding={needsOnboarding} />
      {children}
    </DashboardShell>
  );
}
