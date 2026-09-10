import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminReviewsModerationPanel } from "@/components/dashboard/admin/reviews/AdminReviewsModerationPanel";
import { DashboardPageLayout } from "@/components/dashboard";
import "@/styles/admin-reviews.css";

export const metadata = { title: "Review moderation" };

export default async function AdminReviewsPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (
    !session?.user?.id ||
    (role !== "admin" && role !== "moderator" && role !== "super_admin")
  ) {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="admin-reviews-shell">
      <AdminReviewsModerationPanel />
    </DashboardPageLayout>
  );
}
