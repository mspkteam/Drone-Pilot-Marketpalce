import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminUniformShopPanel } from "@/components/admin/AdminUniformShopPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Uniform Shop" };

export default async function AdminShopPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  return (
    <>
      <PageHeader
        title="Uniform Shop"
        description="Fulfill pilot apparel orders and manage catalog (Super Admin)."
      />
      <div className="mt-8 w-full">
        <AdminUniformShopPanel isSuperAdmin={role === "super_admin"} />
      </div>
    </>
  );
}
