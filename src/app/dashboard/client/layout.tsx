import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { OnboardingRedirect } from "@/components/client/OnboardingRedirect";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";
import { buildDashboardUser } from "@/lib/dashboard/shell-user";
import { clientNavGroups } from "@/lib/navigation/dashboard-client";

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let needsOnboarding = false;
  let user = buildDashboardUser(session?.user ?? {}, {
    displayName: "John Doe",
    roleSubtitle: "Client account",
  });

  if (session?.user?.id && session.user.role === "client") {
    const profile = await getClientProfileByUserId(session.user.id);
    needsOnboarding = !isOnboardingComplete(profile);

    // Screenshot/mock shell — John Doe / JD until client profile shell wiring (M50).
    user = buildDashboardUser(session.user, {
      displayName: "John Doe",
      roleSubtitle: "Client account",
    });
  }

  return (
    <DashboardShell
      homeHref="/dashboard/client"
      navGroups={clientNavGroups}
      user={user}
    >
      <OnboardingRedirect needsOnboarding={needsOnboarding} />
      {children}
    </DashboardShell>
  );
}
