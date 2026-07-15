import { canPerformAction, usesStaffPermissionMap } from "@/lib/auth/moderator-permissions";
import { getModeratorPermissionsFromDb } from "@/lib/auth/moderator-permissions-db";
import { requireAdminSession } from "@/lib/auth/require-admin";
import type {
  PermissionActionKey,
  PermissionModuleKey,
} from "@/types/moderator-permissions";

type AdminSession = Extract<
  Awaited<ReturnType<typeof requireAdminSession>>,
  { ok: true }
>;

export async function requireAdminPermission(
  moduleKey: PermissionModuleKey,
  actionKey: PermissionActionKey,
): Promise<
  AdminSession | { ok: false; status: 401 | 403; error: string }
> {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return authResult;
  }

  const config = usesStaffPermissionMap(authResult.role)
    ? await getModeratorPermissionsFromDb(authResult.userId)
    : null;

  if (
    !canPerformAction(
      authResult.role,
      authResult.userId,
      moduleKey,
      actionKey,
      config,
    )
  ) {
    return {
      ok: false,
      status: 403,
      error: "You do not have permission to perform this action.",
    };
  }

  return authResult;
}

export async function requireAdminModuleView(
  moduleKey: PermissionModuleKey,
): Promise<
  AdminSession | { ok: false; status: 401 | 403; error: string }
> {
  return requireAdminPermission(moduleKey, "view");
}
