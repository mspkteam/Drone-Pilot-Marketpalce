"use client";

import { createContext, useContext, useMemo } from "react";
import {
  canAccess,
  canPerform,
} from "@/lib/auth/moderator-permissions";
import type {
  ModeratorPermissionConfig,
  PermissionActionKey,
  PermissionModuleKey,
} from "@/types/moderator-permissions";
import type { UserRole } from "@/types/roles";

type ModeratorPermissionsContextValue = {
  role: UserRole;
  userId: string | null;
  config: ModeratorPermissionConfig | null;
  canAccess: (moduleKey: PermissionModuleKey) => boolean;
  canPerform: (moduleKey: PermissionModuleKey, actionKey: PermissionActionKey) => boolean;
};

const ModeratorPermissionsContext =
  createContext<ModeratorPermissionsContextValue | null>(null);

type ModeratorPermissionsProviderProps = {
  role: UserRole;
  userId: string | null;
  config: ModeratorPermissionConfig | null;
  children: React.ReactNode;
};

export function ModeratorPermissionsProvider({
  role,
  userId,
  config,
  children,
}: ModeratorPermissionsProviderProps) {
  const value = useMemo<ModeratorPermissionsContextValue>(
    () => ({
      role,
      userId,
      config,
      canAccess: (moduleKey) => canAccess(role, userId ?? undefined, moduleKey, config),
      canPerform: (moduleKey, actionKey) =>
        canPerform(role, userId ?? undefined, moduleKey, actionKey, config),
    }),
    [role, userId, config],
  );

  return (
    <ModeratorPermissionsContext.Provider value={value}>
      {children}
    </ModeratorPermissionsContext.Provider>
  );
}

export function useModeratorPermissions(): ModeratorPermissionsContextValue {
  const ctx = useContext(ModeratorPermissionsContext);
  if (!ctx) {
    throw new Error("useModeratorPermissions must be used within ModeratorPermissionsProvider");
  }
  return ctx;
}

export function useOptionalModeratorPermissions():
  | ModeratorPermissionsContextValue
  | null {
  return useContext(ModeratorPermissionsContext);
}
