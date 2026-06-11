import { listUsersForAdmin } from "@/lib/admin/users";
import {
  getModeratorPermissions,
  MOCK_MODERATOR_SEEDS,
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
  const dbModerators: ModeratorPermissionListItem[] = users
    .filter((user) => user.role === "moderator")
    .map((user) => {
      const config = getModeratorPermissions(user.id);
      return {
        id: user.id,
        name: user.email.split("@")[0] ?? user.email,
        email: user.email,
        status: user.status,
        preset: config.preset,
      };
    });

  const moderators =
    dbModerators.length > 0
      ? dbModerators
      : MOCK_MODERATOR_SEEDS.map((seed) => ({
          ...seed,
          preset: getModeratorPermissions(seed.id).preset,
        }));

  const resolvedSelected =
    selectedUserId && moderators.some((m) => m.id === selectedUserId)
      ? selectedUserId
      : (moderators[0]?.id ?? null);

  const config = resolvedSelected
    ? getModeratorPermissions(resolvedSelected)
    : null;

  return {
    persistenceMode: "preview",
    moderators,
    modules: PERMISSION_MODULES,
    selectedUserId: resolvedSelected,
    config,
  };
}
