import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { roleMeetsRequirement } from "@/lib/auth/permissions";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }
  if (!roleMeetsRequirement(role, "super_admin")) {
    redirect("/dashboard/admin");
  }

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage all platform user accounts (Super Admin)."
      />
      <div className="mt-8 w-full">
        <AdminUsersPanel />
      </div>
    </>
  );
}
