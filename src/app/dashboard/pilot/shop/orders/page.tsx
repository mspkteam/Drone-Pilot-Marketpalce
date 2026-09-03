import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotUniformOrdersList } from "@/components/shop/PilotUniformOrdersList";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import "@/styles/pilot-shop.css";

export const metadata = { title: "Uniform orders" };

export default async function PilotShopOrdersPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  return (
    <DashboardPageLayout className="pilot-shop-shell">
      <PilotUniformOrdersList />
    </DashboardPageLayout>
  );
}
