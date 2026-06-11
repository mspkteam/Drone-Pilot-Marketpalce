import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientAccountSettings } from "@/components/dashboard/client/settings/ClientAccountSettings";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";
import "@/styles/client-settings.css";

export const metadata = { title: "Account settings" };

export default async function ClientSettingsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  return (
    <DashboardPageLayout className="client-settings-shell">
      <ClientAccountSettings />
    </DashboardPageLayout>
  );
}
