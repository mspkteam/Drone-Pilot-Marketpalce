import type { DashboardNavGroup } from "@/types/dashboard-nav";
import type {
  ModeratorPermissionConfig,
  ModeratorPermissionListItem,
  ModeratorPermissionMap,
  PermissionActionKey,
  PermissionModuleDef,
  PermissionModuleKey,
  PermissionPreset,
} from "@/types/moderator-permissions";
import type { UserRole } from "@/types/roles";
import { isAdminRole } from "@/types/roles";

/** Roles whose access is governed by permission maps (not Super Admin). */
export function usesStaffPermissionMap(role: UserRole): boolean {
  return role === "moderator" || role === "admin";
}

export const PERMISSION_MODULES: PermissionModuleDef[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    actions: [{ key: "view", label: "View" }],
  },
  {
    key: "reports",
    label: "Reports & Analytics",
    actions: [
      { key: "view", label: "View" },
      { key: "export", label: "Export" },
    ],
  },
  {
    key: "users",
    label: "Fleet & Personnel",
    actions: [
      { key: "view", label: "View" },
      { key: "edit", label: "Edit users" },
      { key: "invite", label: "Invite user" },
      { key: "export", label: "Export roster" },
    ],
  },
  {
    key: "jobApproval",
    label: "Job Approval Queue",
    actions: [
      { key: "view", label: "View" },
      { key: "review", label: "Review" },
      { key: "approve", label: "Approve" },
      { key: "reject", label: "Reject" },
    ],
  },
  {
    key: "verifications",
    label: "Remote Aviator Verification",
    actions: [
      { key: "view", label: "View" },
      { key: "approve", label: "Approve" },
      { key: "reject", label: "Reject" },
    ],
  },
  {
    key: "messages",
    label: "Messages",
    actions: [
      {
        key: "view",
        label: "View",
        helperText: "Read-only conversation tracking — no send/reply permission.",
      },
    ],
  },
  {
    key: "support",
    label: "Support Chat",
    actions: [
      { key: "view", label: "View" },
      { key: "reply", label: "Reply" },
      { key: "changeStatus", label: "Change status" },
    ],
  },
  {
    key: "disputes",
    label: "Disputes",
    actions: [
      { key: "view", label: "View" },
      { key: "review", label: "Start review" },
      { key: "comment", label: "Post moderator comment" },
      { key: "recommend", label: "Recommend resolution" },
      {
        key: "resolve",
        label: "Resolve",
        dangerous: true,
        helperText: "Usually Admin-only. Enable only when this moderator should finalize disputes.",
      },
    ],
  },
  {
    key: "subscriptions",
    label: "Pilot Tier Plans / Subscriptions",
    actions: [
      { key: "view", label: "View" },
      {
        key: "edit",
        label: "Edit pricing/features",
        dangerous: true,
        helperText: "Usually Admin-only. Moderators should not edit tiers unless explicitly allowed.",
      },
    ],
  },
  {
    key: "commissions",
    label: "Pilot Commissions",
    actions: [
      { key: "view", label: "View" },
      { key: "export", label: "Export" },
      {
        key: "runPayouts",
        label: "Run payouts",
        dangerous: true,
        helperText: "Admin-only by default. High-risk financial action.",
      },
    ],
  },
  {
    key: "certificates",
    label: "Certificates",
    actions: [
      { key: "view", label: "View" },
      { key: "create", label: "Create template" },
      { key: "edit", label: "Edit template" },
      { key: "issue", label: "Issue certificate" },
    ],
  },
  {
    key: "badges",
    label: "Badges & Wings",
    actions: [
      { key: "view", label: "View" },
      { key: "create", label: "Create badge" },
      { key: "edit", label: "Edit badge" },
      { key: "assign", label: "Assign badge" },
    ],
  },
  {
    key: "shop",
    label: "Uniform Shop Products & Orders",
    actions: [
      { key: "view", label: "View" },
      { key: "create", label: "Add/edit products" },
      { key: "manageInventory", label: "Manage inventory" },
      { key: "updateOrderStatus", label: "Update order status" },
    ],
  },
  {
    key: "cmsArticles",
    label: "CMS Articles",
    actions: [
      { key: "view", label: "View" },
      { key: "create", label: "Create" },
      { key: "edit", label: "Edit" },
      { key: "publish", label: "Publish" },
      {
        key: "archive",
        label: "Archive",
        dangerous: true,
        helperText: "Removing published content affects the public site when CMS is connected.",
      },
    ],
  },
  {
    key: "cmsResources",
    label: "CMS Resources",
    actions: [
      { key: "view", label: "View" },
      { key: "create", label: "Create" },
      { key: "edit", label: "Edit" },
      { key: "publish", label: "Publish" },
      {
        key: "archive",
        label: "Archive",
        dangerous: true,
        helperText: "Removing published resources affects the public site when CMS is connected.",
      },
    ],
  },
  {
    key: "configuration",
    label: "Configuration",
    actions: [
      { key: "view", label: "View" },
      {
        key: "manageSettings",
        label: "Edit settings",
        dangerous: true,
        helperText: "Platform configuration is Admin-only by default.",
      },
    ],
  },
];

const ADMIN_PATH_MODULE_ENTRIES: Array<[string, PermissionModuleKey]> = [
  ["/dashboard/admin/verifications", "verifications"],
  ["/dashboard/admin/regions", "configuration"],
  ["/dashboard/admin/squadron-voting", "disputes"],
  ["/dashboard/admin/permissions", "configuration"],
  ["/dashboard/admin/settings", "configuration"],
  ["/dashboard/admin/cms/resources", "cmsResources"],
  ["/dashboard/admin/cms/articles", "cmsArticles"],
  ["/dashboard/admin/cms", "cmsArticles"],
  ["/dashboard/admin/shop", "shop"],
  ["/dashboard/admin/achievements", "badges"],
  ["/dashboard/admin/certificates", "certificates"],
  ["/dashboard/admin/payments", "commissions"],
  ["/dashboard/admin/subscriptions", "subscriptions"],
  ["/dashboard/admin/disputes", "disputes"],
  ["/dashboard/admin/support", "support"],
  ["/dashboard/admin/messages", "messages"],
  ["/dashboard/admin/jobs", "jobApproval"],
  ["/dashboard/admin/users", "users"],
  ["/dashboard/admin/pilots", "users"],
  ["/dashboard/admin/clients", "users"],
  ["/dashboard/admin/applications", "users"],
  ["/dashboard/admin/bookings", "users"],
  ["/dashboard/admin/waitlist", "users"],
  ["/dashboard/admin/reviews", "users"],
  ["/dashboard/admin/reports", "reports"],
  ["/dashboard/admin", "dashboard"],
];

const NAV_HREF_MODULE: Record<string, PermissionModuleKey> = {
  "/dashboard/admin": "dashboard",
  "/dashboard/admin/reports": "reports",
  "/dashboard/admin/users": "users",
  "/dashboard/admin/verifications": "verifications",
  "/dashboard/admin/regions": "configuration",
  "/dashboard/admin/squadron-voting": "disputes",
  "/dashboard/admin/jobs": "jobApproval",
  "/dashboard/admin/messages": "messages",
  "/dashboard/admin/support": "support",
  "/dashboard/admin/disputes": "disputes",
  "/dashboard/admin/subscriptions": "subscriptions",
  "/dashboard/admin/payments": "commissions",
  "/dashboard/admin/certificates": "certificates",
  "/dashboard/admin/achievements": "badges",
  "/dashboard/admin/shop": "shop",
  "/dashboard/admin/cms": "cmsArticles",
  "/dashboard/admin/settings": "configuration",
};

export const MOCK_MODERATOR_SEEDS: ModeratorPermissionListItem[] = [
  {
    id: "mock-mod-hana",
    name: "Hana Okafor",
    email: "hana@example.com",
    status: "active",
    preset: "full",
    role: "moderator",
    isMock: true,
  },
  {
    id: "mock-mod-elara",
    name: "Elara Vance",
    email: "elara@example.com",
    status: "active",
    preset: "limited",
    role: "moderator",
    isMock: true,
  },
  {
    id: "mock-mod-quinn",
    name: "Quinn Mendes",
    email: "quinn@example.com",
    status: "active",
    preset: "custom",
    role: "admin",
    isMock: true,
  },
];

function emptyPermissionMap(): ModeratorPermissionMap {
  return PERMISSION_MODULES.reduce((acc, mod) => {
    acc[mod.key] = {};
    return acc;
  }, {} as ModeratorPermissionMap);
}

function setModuleActions(
  map: ModeratorPermissionMap,
  moduleKey: PermissionModuleKey,
  actions: Partial<Record<PermissionActionKey, boolean>>,
): void {
  map[moduleKey] = { ...map[moduleKey], ...actions };
}

function enableAllOperational(map: ModeratorPermissionMap): void {
  for (const mod of PERMISSION_MODULES) {
    const actions: Partial<Record<PermissionActionKey, boolean>> = {};
    for (const action of mod.actions) {
      actions[action.key] = true;
    }
    setModuleActions(map, mod.key, actions);
  }

  setModuleActions(map, "disputes", { resolve: false });
  setModuleActions(map, "subscriptions", { edit: false });
  setModuleActions(map, "commissions", { runPayouts: false });
  setModuleActions(map, "configuration", { view: false, manageSettings: false });
}

function buildLimitedPreset(): ModeratorPermissionMap {
  const map = emptyPermissionMap();
  setModuleActions(map, "dashboard", { view: true });
  setModuleActions(map, "jobApproval", {
    view: true,
    review: true,
    approve: true,
    reject: true,
  });
  setModuleActions(map, "verifications", {
    view: true,
    approve: true,
    reject: true,
  });
  setModuleActions(map, "disputes", { view: true, review: true, comment: true });
  setModuleActions(map, "support", { view: true });
  setModuleActions(map, "messages", { view: true });
  return map;
}

function buildCustomSeedPreset(): ModeratorPermissionMap {
  const map = buildLimitedPreset();
  setModuleActions(map, "reports", { view: true });
  setModuleActions(map, "users", { view: true, export: true });
  setModuleActions(map, "certificates", { view: true, issue: true });
  return map;
}

export function buildPresetPermissions(preset: PermissionPreset): ModeratorPermissionMap {
  if (preset === "full") {
    const map = emptyPermissionMap();
    enableAllOperational(map);
    return map;
  }
  if (preset === "limited") {
    return buildLimitedPreset();
  }
  return buildCustomSeedPreset();
}

export function getDefaultModeratorPermissions(
  userId: string,
  preset: PermissionPreset = "full",
): ModeratorPermissionConfig {
  return {
    userId,
    preset,
    permissions: buildPresetPermissions(preset),
    updatedAt: null,
    updatedBy: null,
  };
}

/** @deprecated Use getModeratorPermissionsFromDb in server code. */
export function getModeratorPermissions(userId: string): ModeratorPermissionConfig {
  return getDefaultModeratorPermissions(userId, "full");
}

/** @deprecated Use saveModeratorPermissionsToDb in server code. */
export function saveModeratorPermissions(
  config: ModeratorPermissionConfig,
  updatedBy: string,
): ModeratorPermissionConfig {
  return {
    ...config,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
}

export function getModuleKeyForAdminPath(pathname: string): PermissionModuleKey | null {
  const normalized = pathname.split("?")[0]?.replace(/\/$/, "") || "/dashboard/admin";
  for (const [prefix, moduleKey] of ADMIN_PATH_MODULE_ENTRIES) {
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
      return moduleKey;
    }
  }
  return null;
}

export function getModuleKeyForNavHref(href: string): PermissionModuleKey | null {
  return NAV_HREF_MODULE[href] ?? null;
}

export function canAccessModule(
  role: UserRole,
  userId: string | undefined,
  moduleKey: PermissionModuleKey,
  config?: ModeratorPermissionConfig | null,
): boolean {
  if (role === "super_admin") return true;
  if (!usesStaffPermissionMap(role) || !userId) return false;

  const permissions = config ?? getModeratorPermissions(userId);
  return permissions.permissions[moduleKey]?.view === true;
}

export function canPerformAction(
  role: UserRole,
  userId: string | undefined,
  moduleKey: PermissionModuleKey,
  actionKey: PermissionActionKey,
  config?: ModeratorPermissionConfig | null,
): boolean {
  if (role === "super_admin") return true;
  if (!usesStaffPermissionMap(role) || !userId) return false;

  const permissions = config ?? getModeratorPermissions(userId);
  const modulePerms = permissions.permissions[moduleKey] ?? {};
  if (!modulePerms.view) return false;
  return modulePerms[actionKey] === true;
}

/** Alias helpers for pages and components */
export function canAccess(
  role: UserRole,
  userId: string | undefined,
  moduleKey: PermissionModuleKey,
  config?: ModeratorPermissionConfig | null,
): boolean {
  return canAccessModule(role, userId, moduleKey, config);
}

export function canPerform(
  role: UserRole,
  userId: string | undefined,
  moduleKey: PermissionModuleKey,
  actionKey: PermissionActionKey,
  config?: ModeratorPermissionConfig | null,
): boolean {
  return canPerformAction(role, userId, moduleKey, actionKey, config);
}

export function canAccessAdminPathWithPermissions(
  role: UserRole,
  pathname: string,
  userId?: string,
  config?: ModeratorPermissionConfig | null,
): boolean {
  if (!isAdminRole(role)) return false;
  if (role === "super_admin") return true;
  if (pathname.startsWith("/dashboard/admin/permissions")) return false;

  const moduleKey = getModuleKeyForAdminPath(pathname);
  if (!moduleKey) return true;
  return canAccessModule(role, userId, moduleKey, config);
}

const SUPER_ADMIN_ONLY_NAV_HREFS = new Set(["/dashboard/admin/permissions"]);

function stripSuperAdminOnlyNavItems<T extends { href: string }>(
  items: readonly T[],
  role: UserRole,
): T[] {
  if (role === "super_admin") {
    return [...items];
  }
  return items.filter((item) => !SUPER_ADMIN_ONLY_NAV_HREFS.has(item.href));
}

export function filterAdminNavForPermissions(
  navGroups: readonly DashboardNavGroup[],
  role: UserRole,
  userId: string | undefined,
  config?: ModeratorPermissionConfig | null,
): DashboardNavGroup[] {
  if (role === "super_admin") {
    return navGroups.map((group) => ({
      ...group,
      items: [...group.items],
    }));
  }

  if (!usesStaffPermissionMap(role) || !userId) {
    return navGroups
      .map((group) => ({
        ...group,
        items: stripSuperAdminOnlyNavItems(group.items, role),
      }))
      .filter((group) => group.items.length > 0);
  }

  return navGroups
    .map((group) => ({
      ...group,
      items: stripSuperAdminOnlyNavItems(group.items, role).filter((item) => {
        const moduleKey = getModuleKeyForNavHref(item.href);
        if (!moduleKey) return true;
        return canAccessModule(role, userId, moduleKey, config);
      }),
    }))
    .filter((group) => group.items.length > 0);
}

export function presetLabel(preset: PermissionPreset): string {
  switch (preset) {
    case "full":
      return "Full Access";
    case "limited":
      return "Limited";
    case "custom":
      return "Custom";
    default:
      return preset;
  }
}
