import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminApplicationsPanel } from "@/components/admin/AdminApplicationsPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Applications" };

export default async function AdminApplicationsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  return (
    <>
      <PageHeader
        title="Applications"
        description="View all pilot bids and applications across jobs."
      />
      <div className="mt-8 max-w-4xl">
        <AdminApplicationsPanel />
      </div>
    </>
  );
}
