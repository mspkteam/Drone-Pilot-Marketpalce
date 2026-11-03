import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminClientsPanel } from "@/components/admin/AdminClientsPanel";
import { DashboardPageLayout } from "@/components/dashboard";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-personnel.css";

export const metadata = { title: "Client Approvals" };

/** Dedicated queue to approve client profiles still in draft / pending review. */
export default async function AdminClientsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="admin-personnel-shell">
      <section
        className="admin-personnel-hero admin-ops-bracket-card"
        aria-label="Client profile approvals"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-personnel-hero-inner">
          <div className="admin-personnel-hero-copy">
            <p className="admin-ops-eyebrow">FLEET MODERATION</p>
            <h1 className="admin-personnel-hero-title">Client Approvals</h1>
            <p className="admin-personnel-hero-desc">
              Approve client profiles that are still draft or pending review.
              Full roster editing stays under Users. Job posts are approved in
              Job Approval.
            </p>
          </div>
          <div className="admin-personnel-hero-actions">
            <a
              href="/dashboard/admin/users?role=client"
              className="admin-personnel-btn-outline"
            >
              Open client roster
            </a>
          </div>
        </div>
      </section>
      <section className="admin-personnel-directory" aria-label="Client approval queue">
        <AdminClientsPanel />
      </section>
    </DashboardPageLayout>
  );
}
