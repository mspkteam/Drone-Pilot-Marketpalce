import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminClientsPanel } from "@/components/admin/AdminClientsPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Clients" };

export default async function AdminClientsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  return (
    <>
      <PageHeader
        title="Clients"
        description="View client accounts and job activity."
      />
      <div className="mt-8 max-w-4xl">
        <AdminClientsPanel />
      </div>
    </>
  );
}
