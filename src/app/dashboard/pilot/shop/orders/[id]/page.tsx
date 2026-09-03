import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotUniformOrderDetail } from "@/components/shop/PilotUniformOrderDetail";
import { DashboardPageLayout } from "@/components/dashboard";
import { getOrderForUser } from "@/lib/shop/shop";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import "@/styles/pilot-shop.css";

type PageProps = { params: Promise<{ id: string }> };

export default async function PilotShopOrderDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  const { id } = await params;
  const order = await getOrderForUser(id, session.user.id);
  if (!order) {
    notFound();
  }

  return (
    <DashboardPageLayout className="pilot-shop-shell">
      <PilotUniformOrderDetail initialOrder={order} />
    </DashboardPageLayout>
  );
}
