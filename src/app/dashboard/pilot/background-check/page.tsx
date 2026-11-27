import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotBackgroundCheckView } from "@/components/dashboard/pilot/background-check/PilotBackgroundCheckView";
import { DashboardPageLayout } from "@/components/dashboard";
import "@/styles/background-check.css";

export const metadata = { title: "Background Check" };

export default async function PilotBackgroundCheckPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="bgc-shell">
      <PilotBackgroundCheckView />
    </DashboardPageLayout>
  );
}
