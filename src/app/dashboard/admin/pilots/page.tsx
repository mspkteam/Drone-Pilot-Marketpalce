import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminPilotsPanel } from "@/components/admin/AdminPilotsPanel";
import { DashboardPageLayout } from "@/components/dashboard";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-personnel.css";

export const metadata = { title: "Pilot Approvals" };

/** Dedicated queue to approve / reject pilot profiles pending review. */
export default async function AdminPilotsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="admin-personnel-shell">
      <section
        className="admin-personnel-hero admin-ops-bracket-card"
        aria-label="Pilot profile approvals"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-personnel-hero-inner">
          <div className="admin-personnel-hero-copy">
            <p className="admin-ops-eyebrow">FLEET MODERATION</p>
            <h1 className="admin-personnel-hero-title">Pilot Approvals</h1>
            <p className="admin-personnel-hero-desc">
              Review pilots in pending review and approve or reject their
              profiles. Full roster editing stays under Users.
            </p>
          </div>
          <div className="admin-personnel-hero-actions">
            <a
              href="/dashboard/admin/users?role=pilot"
              className="admin-personnel-btn-outline"
            >
              Open pilot roster
            </a>
          </div>
        </div>
      </section>
      <section className="admin-personnel-directory" aria-label="Pilot approval queue">
        <AdminPilotsPanel />
      </section>
    </DashboardPageLayout>
  );
}
