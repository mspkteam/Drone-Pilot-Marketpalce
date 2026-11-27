import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotPayoutSetupView } from "@/components/dashboard/pilot/payouts/PilotPayoutSetupView";
import { DashboardPageLayout } from "@/components/dashboard";
import "@/styles/pilot-payouts.css";

export const metadata = { title: "Payout setup" };

export default async function PilotPayoutsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="pilot-payouts-shell">
      <PilotPayoutSetupView />
    </DashboardPageLayout>
  );
}
