import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientBillingPayments } from "@/components/dashboard/client/billing/ClientBillingPayments";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";
import "@/styles/client-billing.css";

export const metadata = { title: "Billing & Payments" };

export default async function ClientPaymentsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  return (
    <DashboardPageLayout className="client-billing-shell">
      <ClientBillingPayments />
    </DashboardPageLayout>
  );
}
