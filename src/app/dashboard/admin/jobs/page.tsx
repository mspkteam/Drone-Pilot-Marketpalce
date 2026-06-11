import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminJobApprovalQueue } from "@/components/dashboard/admin/job-approval/AdminJobApprovalQueue";
import { DashboardPageLayout } from "@/components/dashboard";
import { getJobApprovalQueueData } from "@/lib/admin/job-approval-queue";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-job-approval.css";

export const metadata = { title: "Job Approval Queue" };

export default async function AdminJobsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const initialData = await getJobApprovalQueueData();

  return (
    <DashboardPageLayout className="admin-job-approval-shell">
      <AdminJobApprovalQueue initialData={initialData} />
    </DashboardPageLayout>
  );
}
