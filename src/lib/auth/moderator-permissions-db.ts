import { prisma } from "@/lib/db";
import {
  buildPresetPermissions,
  getDefaultModeratorPermissions,
} from "@/lib/auth/moderator-permissions";
import type {
  ModeratorPermissionConfig,
  ModeratorPermissionMap,
  PermissionPreset,
} from "@/types/moderator-permissions";

function parsePermissions(json: string): ModeratorPermissionMap {
  return JSON.parse(json) as ModeratorPermissionMap;
}

function toConfig(record: {
  userId: string;
  preset: string;
  permissionsJson: string;
  updatedAt: Date;
  updatedByUserId: string | null;
}): ModeratorPermissionConfig {
  return {
    userId: record.userId,
    preset: record.preset as PermissionPreset,
    permissions: parsePermissions(record.permissionsJson),
    updatedAt: record.updatedAt.toISOString(),
    updatedBy: record.updatedByUserId,
  };
}

export async function getModeratorPermissionsFromDb(
  userId: string,
): Promise<ModeratorPermissionConfig> {
  const record = await prisma.moderatorPermissionRecord.findUnique({
    where: { userId },
  });
  if (record) {
    return toConfig(record);
  }
  return getDefaultModeratorPermissions(userId, "full");
}

export async function saveModeratorPermissionsToDb(
  config: ModeratorPermissionConfig,
  updatedBy: string,
): Promise<ModeratorPermissionConfig> {
  const preset = config.preset;
  const permissions =
    preset === "custom"
      ? config.permissions
      : buildPresetPermissions(preset);

  const record = await prisma.moderatorPermissionRecord.upsert({
    where: { userId: config.userId },
    create: {
      userId: config.userId,
      preset,
      permissionsJson: JSON.stringify(permissions),
      updatedByUserId: updatedBy,
    },
    update: {
      preset,
      permissionsJson: JSON.stringify(permissions),
      updatedByUserId: updatedBy,
    },
  });

  return toConfig(record);
}

export async function listModeratorPermissionRecords(): Promise<
  ModeratorPermissionConfig[]
> {
  const records = await prisma.moderatorPermissionRecord.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return records.map(toConfig);
}
