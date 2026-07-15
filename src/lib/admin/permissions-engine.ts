import { listUsersForAdmin } from "@/lib/admin/users";
import { getModeratorPermissionsFromDb } from "@/lib/auth/moderator-permissions-db";
import { PERMISSION_MODULES } from "@/lib/auth/moderator-permissions";
import type {
  AdminPermissionsEngineDto,
  ModeratorPermissionListItem,
} from "@/types/moderator-permissions";
import { isManagementUserRole } from "@/types/roles";

export async function getAdminPermissionsEngineData(
  selectedUserId?: string | null,
): Promise<AdminPermissionsEngineDto> {
  const users = await listUsersForAdmin();
  const staff: ModeratorPermissionListItem[] = await Promise.all(
    users
      .filter((user) => isManagementUserRole(user.role))
      .map(async (user) => {
        const config = await getModeratorPermissionsFromDb(user.id);
        const role = user.role as "admin" | "moderator";
        return {
          id: user.id,
          name: user.email.split("@")[0] ?? user.email,
          email: user.email,
          status: user.status,
          preset: config.preset,
          role,
        };
      }),
  );

  // Admins first, then moderators — stable for Super Admin browsing.
  staff.sort((a, b) => {
    if (a.role !== b.role) return a.role === "admin" ? -1 : 1;
    return a.email.localeCompare(b.email);
  });

  const resolvedSelected =
    selectedUserId && staff.some((m) => m.id === selectedUserId)
      ? selectedUserId
      : (staff[0]?.id ?? null);

  const config = resolvedSelected
    ? await getModeratorPermissionsFromDb(resolvedSelected)
    : null;

  return {
    persistenceMode: "persisted",
    moderators: staff,
    modules: PERMISSION_MODULES,
    selectedUserId: resolvedSelected,
    config,
  };
}
