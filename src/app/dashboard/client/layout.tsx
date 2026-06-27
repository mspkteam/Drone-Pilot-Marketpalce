import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { OnboardingRedirect } from "@/components/client/OnboardingRedirect";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";
import { buildClientShellUser } from "@/lib/dashboard/shell-user";
import { getMilestoneShellProps } from "@/lib/milestone-shell-props";
import { clientNavGroups } from "@/lib/navigation/dashboard-client";

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let needsOnboarding = false;
  let user = buildClientShellUser(session?.user ?? {}, null);

  if (session?.user?.id && session.user.role === "client") {
    const profile = await getClientProfileByUserId(session.user.id);
    needsOnboarding = !isOnboardingComplete(profile);
    user = buildClientShellUser(session.user, profile);
  }

  const milestone = getMilestoneShellProps(
    session?.user?.role === "client" ? "client" : undefined,
  );

  return (
    <DashboardShell
      homeHref="/dashboard/client"
      navGroups={clientNavGroups}
      user={user}
      {...milestone}
    >
      <OnboardingRedirect needsOnboarding={needsOnboarding} />
      {children}
    </DashboardShell>
  );
}
