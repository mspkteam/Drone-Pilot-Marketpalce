import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminUniformShopPortal } from "@/components/admin/shop/AdminUniformShopPortal";
import { DashboardPageLayout } from "@/components/dashboard";
import { canPerform, usesStaffPermissionMap } from "@/lib/auth/moderator-permissions";
import { getModeratorPermissionsFromDb } from "@/lib/auth/moderator-permissions-db";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-shop.css";

export const metadata = { title: "Products & Orders" };

export default async function AdminShopPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const permissionConfig = usesStaffPermissionMap(role)
    ? await getModeratorPermissionsFromDb(session.user.id)
    : null;
  const canManageProducts =
    canPerform(role, session.user.id, "shop", "create", permissionConfig) ||
    canPerform(role, session.user.id, "shop", "manageInventory", permissionConfig);

  return (
    <DashboardPageLayout className="admin-shop-shell">
      <AdminUniformShopPortal canManageProducts={canManageProducts} />
    </DashboardPageLayout>
  );
}
