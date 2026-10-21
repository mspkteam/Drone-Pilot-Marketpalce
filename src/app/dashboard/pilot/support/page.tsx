import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotSupportHelpCenter } from "@/components/dashboard/pilot/support/PilotSupportHelpCenter";
import { DashboardPageLayout } from "@/components/dashboard";
import "@/styles/pilot-support.css";

export const metadata = { title: "Support & Help Center" };

export default async function PilotSupportPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="pilot-support-shell">
      <PilotSupportHelpCenter />
    </DashboardPageLayout>
  );
}
