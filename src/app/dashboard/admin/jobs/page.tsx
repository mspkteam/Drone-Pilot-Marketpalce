import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminJobsPanel } from "@/components/admin/AdminJobsPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { countPendingJobs } from "@/lib/jobs/admin";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Jobs" };

export default async function AdminJobsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const pendingCount = await countPendingJobs();

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Approve or reject client job postings before pilots can bid."
      />
      {pendingCount > 0 ? (
        <p className="mt-4 rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-dark">
          {pendingCount} job{pendingCount === 1 ? "" : "s"} awaiting approval.
        </p>
      ) : null}
      <div className="mt-8 max-w-4xl">
        <AdminJobsPanel />
      </div>
    </>
  );
}
