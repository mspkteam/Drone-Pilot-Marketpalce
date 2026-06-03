import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { OnboardingRedirect } from "@/components/pilot/OnboardingRedirect";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import { pilotNav } from "@/lib/navigation/pilot";

export default async function PilotDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let needsOnboarding = false;

  if (session?.user?.id && session.user.role === "pilot") {
    const profile = await getPilotProfileByUserId(session.user.id);
    needsOnboarding = !isOnboardingComplete(profile);
  }

  return (
    <DashboardShell roleLabel="Pilot Dashboard" navItems={pilotNav}>
      <OnboardingRedirect needsOnboarding={needsOnboarding} />
      {children}
    </DashboardShell>
  );
}
