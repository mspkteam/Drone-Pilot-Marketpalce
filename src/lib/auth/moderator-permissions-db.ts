import { prisma } from "@/lib/db";
import {
  buildPresetPermissions,
  getDefaultModeratorPermissions,
} from "@/lib/auth/moderator-permissions";
import { PERMISSION_MODULE_KEYS } from "@/types/moderator-permissions";
import type {
  ModeratorPermissionConfig,
  ModeratorPermissionMap,
  ModulePermissions,
  PermissionPreset,
} from "@/types/moderator-permissions";

function parsePermissions(json: string): ModeratorPermissionMap {
  const parsed = JSON.parse(json) as Partial<ModeratorPermissionMap>;
  const map = {} as ModeratorPermissionMap;
  for (const key of PERMISSION_MODULE_KEYS) {
    map[key] = (parsed[key] ?? {}) as ModulePermissions;
  }
  return map;
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
  const newJson = JSON.stringify(permissions);

  const existing = await prisma.moderatorPermissionRecord.findUnique({
    where: { userId: config.userId },
  });

  const record = await prisma.moderatorPermissionRecord.upsert({
    where: { userId: config.userId },
    create: {
      userId: config.userId,
      preset,
      permissionsJson: newJson,
      updatedByUserId: updatedBy,
    },
    update: {
      preset,
      permissionsJson: newJson,
      updatedByUserId: updatedBy,
    },
  });

  await prisma.moderatorPermissionAuditLog.create({
    data: {
      targetUserId: config.userId,
      actorUserId: updatedBy,
      previousPreset: existing?.preset ?? "none",
      newPreset: preset,
      previousJson: existing?.permissionsJson ?? "{}",
      newJson,
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
