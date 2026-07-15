import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminJobReview } from "@/components/admin/AdminJobReview";
import { DashboardPageLayout } from "@/components/dashboard";
import { getJobForAdmin } from "@/lib/jobs/admin";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-job-approval.css";

export const metadata = { title: "Review mission" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminJobReviewPage({ params }: PageProps) {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const { id } = await params;
  const job = await getJobForAdmin(id);
  if (!job) {
    notFound();
  }

  return (
    <DashboardPageLayout className="admin-job-approval-shell">
      <AdminJobReview job={job} />
    </DashboardPageLayout>
  );
}
