import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotUniformShop } from "@/components/shop/PilotUniformShop";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import "@/styles/pilot-shop.css";

export const metadata = { title: "Uniform & Insignia Shop" };

export default async function PilotShopPage() {
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
      <PilotUniformShop />
    </DashboardPageLayout>
  );
}
