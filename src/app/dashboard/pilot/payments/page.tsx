import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotPaymentsView } from "@/components/dashboard/pilot/payments/PilotPaymentsView";
import { DashboardPageLayout } from "@/components/dashboard";
import { DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import "@/styles/pilot-payments.css";

export const metadata = { title: "Payments" };

export default async function PilotPaymentsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  const commissionRatePercent = Math.round(DEFAULT_COMMISSION_RATE * 100);

  return (
    <DashboardPageLayout className="pilot-payments-shell">
      <PilotPaymentsView commissionRatePercent={commissionRatePercent} />
    </DashboardPageLayout>
  );
}
