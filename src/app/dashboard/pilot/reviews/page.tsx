import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotReviewsView } from "@/components/dashboard/pilot/reviews/PilotReviewsView";
import { DashboardPageLayout } from "@/components/dashboard";
import "@/styles/pilot-reviews.css";

export const metadata = { title: "Reviews" };

export default async function PilotReviewsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="pilot-reviews-shell">
      <PilotReviewsView />
    </DashboardPageLayout>
  );
}
