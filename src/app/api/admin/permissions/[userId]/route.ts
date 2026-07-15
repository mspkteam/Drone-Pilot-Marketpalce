import { NextResponse } from "next/server";
import { buildPresetPermissions } from "@/lib/auth/moderator-permissions";
import {
  getModeratorPermissionsFromDb,
  saveModeratorPermissionsToDb,
} from "@/lib/auth/moderator-permissions-db";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";
import { prisma } from "@/lib/db";
import type {
  ModeratorPermissionConfig,
  PermissionPreset,
} from "@/types/moderator-permissions";
import { isManagementUserRole } from "@/types/roles";

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
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !isManagementUserRole(user.role)) {
    return NextResponse.json(
      { error: "Management user not found." },
      { status: 404 },
    );
  }

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
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !isManagementUserRole(user.role)) {
    return NextResponse.json(
      {
        error:
          "Only Admin and Moderator accounts can have limited permissions.",
      },
      { status: 400 },
    );
  }

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

  const roleLabel = user.role === "admin" ? "Admin" : "Moderator";

  return NextResponse.json({
    config: saved,
    persistenceMode: "persisted" as const,
    message: `${roleLabel} permissions saved.`,
  });
}
