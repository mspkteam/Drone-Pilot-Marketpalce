import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSubscriptionsPanel } from "@/components/admin/AdminSubscriptionsPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { roleMeetsRequirement } from "@/lib/auth/permissions";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Subscriptions" };

export default async function AdminSubscriptionsPage() {
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
        title="Subscriptions"
        description="View subscription plans and pilot enrollments (Super Admin)."
      />
      <div className="mt-8 w-full">
        <AdminSubscriptionsPanel />
      </div>
    </>
  );
}
