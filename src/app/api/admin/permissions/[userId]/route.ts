import { NextResponse } from "next/server";
import {
  buildPresetPermissions,
  getModeratorPermissions,
  saveModeratorPermissions,
} from "@/lib/auth/moderator-permissions";
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
  const config = getModeratorPermissions(userId);
  return NextResponse.json({ config, persistenceMode: "preview" as const });
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

  const current = getModeratorPermissions(userId);
  const preset = body.preset ?? current.preset;
  const permissions =
    preset === "custom" && body.permissions
      ? body.permissions
      : preset !== "custom"
        ? buildPresetPermissions(preset)
        : current.permissions;

  const saved = saveModeratorPermissions(
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
    persistenceMode: "preview" as const,
    message:
      "Permission persistence is pending. Changes are preview-only until backend access control is connected.",
  });
}
