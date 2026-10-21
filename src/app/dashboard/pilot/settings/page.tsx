import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotAccountSettings } from "@/components/dashboard/pilot/settings/PilotAccountSettings";
import { DashboardPageLayout } from "@/components/dashboard";
import "@/styles/pilot-settings.css";

export const metadata = { title: "Pilot Settings" };

export default async function PilotSettingsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="pilot-settings-shell">
      <PilotAccountSettings />
    </DashboardPageLayout>
  );
}
