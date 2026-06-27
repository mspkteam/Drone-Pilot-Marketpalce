import { NextResponse } from "next/server";
import {
  buildPresetPermissions,
} from "@/lib/auth/moderator-permissions";
import {
  getModeratorPermissionsFromDb,
  saveModeratorPermissionsToDb,
} from "@/lib/auth/moderator-permissions-db";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";
import type {
  ModeratorPermissionConfig,
  PermissionPreset,
} from "@/types/moderator-permissions";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { userId } = await context.params;
  const config = await getModeratorPermissionsFromDb(userId);
  return NextResponse.json({ config, persistenceMode: "persisted" as const });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { userId } = await context.params;
  const body = (await request.json()) as {
    preset?: PermissionPreset;
    permissions?: ModeratorPermissionConfig["permissions"];
  };

  const current = await getModeratorPermissionsFromDb(userId);
  const preset = body.preset ?? current.preset;
  const permissions =
    preset === "custom" && body.permissions
      ? body.permissions
      : preset !== "custom"
        ? buildPresetPermissions(preset)
        : current.permissions;

  const saved = await saveModeratorPermissionsToDb(
    {
      userId,
      preset,
      permissions,
      updatedAt: null,
      updatedBy: null,
    },
    authResult.userId,
  );

  return NextResponse.json({
    config: saved,
    persistenceMode: "persisted" as const,
    message: "Moderator permissions saved.",
  });
}
