export const PERMISSION_PRESETS = ["full", "limited", "custom"] as const;
export type PermissionPreset = (typeof PERMISSION_PRESETS)[number];

export const PERMISSION_MODULE_KEYS = [
  "dashboard",
  "reports",
  "users",
  "jobApproval",
  "messages",
  "support",
  "disputes",
  "subscriptions",
  "commissions",
  "certificates",
  "badges",
  "shop",
  "cmsArticles",
  "cmsResources",
  "configuration",
] as const;

export type PermissionModuleKey = (typeof PERMISSION_MODULE_KEYS)[number];

export const PERMISSION_ACTION_KEYS = [
  "view",
  "create",
  "edit",
  "delete",
  "approve",
  "reject",
  "review",
  "resolve",
  "export",
  "publish",
  "assign",
  "runPayouts",
  "manageSettings",
  "invite",
  "reply",
  "changeStatus",
  "comment",
  "recommend",
  "issue",
  "archive",
  "manageInventory",
  "updateOrderStatus",
] as const;

export type PermissionActionKey = (typeof PERMISSION_ACTION_KEYS)[number];

export type ModulePermissions = Partial<Record<PermissionActionKey, boolean>>;

export type ModeratorPermissionMap = Record<
  PermissionModuleKey,
  ModulePermissions
>;

export type ModeratorPermissionConfig = {
  userId: string;
  preset: PermissionPreset;
  permissions: ModeratorPermissionMap;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type PermissionActionDef = {
  key: PermissionActionKey;
  label: string;
  helperText?: string;
  dangerous?: boolean;
};

export type PermissionModuleDef = {
  key: PermissionModuleKey;
  label: string;
  actions: PermissionActionDef[];
};

export type ModeratorPermissionListItem = {
  id: string;
  name: string;
  email: string;
  status: string;
  preset: PermissionPreset;
  isMock?: boolean;
};

export type AdminPermissionsEngineDto = {
  persistenceMode: "preview" | "persisted";
  moderators: ModeratorPermissionListItem[];
  modules: PermissionModuleDef[];
  selectedUserId: string | null;
  config: ModeratorPermissionConfig | null;
};
