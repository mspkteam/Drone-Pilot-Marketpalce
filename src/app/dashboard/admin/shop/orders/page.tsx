import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShopOrdersPortal } from "@/components/admin/shop/AdminShopOrdersPortal";
import { DashboardPageLayout } from "@/components/dashboard";
import { canPerform, usesStaffPermissionMap } from "@/lib/auth/moderator-permissions";
import { getModeratorPermissionsFromDb } from "@/lib/auth/moderator-permissions-db";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-shop.css";

export const metadata = { title: "All Orders" };

export default async function AdminShopOrdersPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const permissionConfig = usesStaffPermissionMap(role)
    ? await getModeratorPermissionsFromDb(session.user.id)
    : null;
  const canUpdateOrders = canPerform(
    role,
    session.user.id,
    "shop",
    "updateOrderStatus",
    permissionConfig,
  );

  return (
    <DashboardPageLayout className="admin-shop-shell">
      <AdminShopOrdersPortal canUpdateOrders={canUpdateOrders} />
    </DashboardPageLayout>
  );
}
