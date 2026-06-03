import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminDisputesPanel } from "@/components/admin/AdminDisputesPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Disputes" };

export default async function AdminDisputesPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  return (
    <>
      <PageHeader
        title="Disputes"
        description="Review booking disputes, collect evidence from both parties, and resolve payouts."
      />
      <div className="mt-8 max-w-4xl">
        <AdminDisputesPanel />
      </div>
    </>
  );
}
