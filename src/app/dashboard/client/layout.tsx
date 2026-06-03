import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { OnboardingRedirect } from "@/components/client/OnboardingRedirect";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";
import { clientNav } from "@/lib/navigation/client";

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let needsOnboarding = false;

  if (session?.user?.id && session.user.role === "client") {
    const profile = await getClientProfileByUserId(session.user.id);
    needsOnboarding = !isOnboardingComplete(profile);
  }

  return (
    <DashboardShell roleLabel="Client Dashboard" navItems={clientNav}>
      <OnboardingRedirect needsOnboarding={needsOnboarding} />
      {children}
    </DashboardShell>
  );
}
