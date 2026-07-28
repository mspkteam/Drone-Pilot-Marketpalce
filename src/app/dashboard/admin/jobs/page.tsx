import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminJobApprovalQueue } from "@/components/dashboard/admin/job-approval/AdminJobApprovalQueue";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getJobApprovalQueueData,
  isJobApprovalStatusFilter,
} from "@/lib/admin/job-approval-queue";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-job-approval.css";

export const metadata = { title: "Job Approval Queue" };

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminJobsPage({ searchParams }: PageProps) {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const params = await searchParams;
  const statusFilter = isJobApprovalStatusFilter(params.status)
    ? params.status
    : "pending_approval";

  const initialData = await getJobApprovalQueueData(statusFilter);

  return (
    <DashboardPageLayout className="admin-job-approval-shell">
      <Suspense fallback={<p className="admin-job-approval-empty">Loading…</p>}>
        <AdminJobApprovalQueue initialData={initialData} />
      </Suspense>
    </DashboardPageLayout>
  );
}
