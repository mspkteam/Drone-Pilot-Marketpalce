import { listUsersForAdmin } from "@/lib/admin/users";
import {
  getModeratorPermissionsFromDb,
} from "@/lib/auth/moderator-permissions-db";
import {
  PERMISSION_MODULES,
} from "@/lib/auth/moderator-permissions";
import type {
  AdminPermissionsEngineDto,
  ModeratorPermissionListItem,
} from "@/types/moderator-permissions";

export async function getAdminPermissionsEngineData(
  selectedUserId?: string | null,
): Promise<AdminPermissionsEngineDto> {
  const users = await listUsersForAdmin();
  const moderators: ModeratorPermissionListItem[] = await Promise.all(
    users
      .filter((user) => user.role === "moderator")
      .map(async (user) => {
        const config = await getModeratorPermissionsFromDb(user.id);
        return {
          id: user.id,
          name: user.email.split("@")[0] ?? user.email,
          email: user.email,
          status: user.status,
          preset: config.preset,
        };
      }),
  );

  const resolvedSelected =
    selectedUserId && moderators.some((m) => m.id === selectedUserId)
      ? selectedUserId
      : (moderators[0]?.id ?? null);

  const config = resolvedSelected
    ? await getModeratorPermissionsFromDb(resolvedSelected)
    : null;

  return {
    persistenceMode: "persisted",
    moderators,
    modules: PERMISSION_MODULES,
    selectedUserId: resolvedSelected,
    config,
  };
}
