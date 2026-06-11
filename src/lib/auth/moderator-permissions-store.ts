import type { ModeratorPermissionConfig } from "@/types/moderator-permissions";

/** In-memory preview store — resets on server restart. */
const store = new Map<string, ModeratorPermissionConfig>();

export function getStoredModeratorPermissions(
  userId: string,
): ModeratorPermissionConfig | null {
  return store.get(userId) ?? null;
}

export function setStoredModeratorPermissions(
  config: ModeratorPermissionConfig,
): ModeratorPermissionConfig {
  store.set(config.userId, config);
  return config;
}

export function listStoredModeratorPermissions(): ModeratorPermissionConfig[] {
  return Array.from(store.values());
}
