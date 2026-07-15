"use client";

import { usePathname } from "next/navigation";
import { ModeratorAccessRestricted } from "@/components/admin/ModeratorAccessRestricted";
import {
  canAccessAdminPathWithPermissions,
  getModuleKeyForAdminPath,
  usesStaffPermissionMap,
} from "@/lib/auth/moderator-permissions";
import type { ModeratorPermissionConfig } from "@/types/moderator-permissions";
import type { UserRole } from "@/types/roles";

type ModeratorRouteGuardProps = {
  role: UserRole;
  userId: string | null;
  config: ModeratorPermissionConfig | null;
  children: React.ReactNode;
};

export function ModeratorRouteGuard({
  role,
  userId,
  config,
  children,
}: ModeratorRouteGuardProps) {
  const pathname = usePathname() ?? "/dashboard/admin";

  if (role === "super_admin") {
    return children;
  }

  if (!usesStaffPermissionMap(role) || !userId) {
    return children;
  }

  if (pathname.startsWith("/dashboard/admin/permissions")) {
    return <ModeratorAccessRestricted />;
  }

  const allowed = canAccessAdminPathWithPermissions(
    role,
    pathname,
    userId,
    config,
  );

  if (!allowed) {
    const moduleKey = getModuleKeyForAdminPath(pathname);
    const moduleLabel = moduleKey
      ? moduleKey.replace(/([A-Z])/g, " $1").trim()
      : "this area";
    return (
      <ModeratorAccessRestricted
        message={`Your Super Admin has disabled access to ${moduleLabel}.`}
      />
    );
  }

  return children;
}
