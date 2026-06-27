import type { ClientNotificationPreferences } from "@/lib/client/settings-notifications";

export type ClientPreferredContact = "Email" | "Phone" | "Messages";

export type ClientProfilePreferences = {
  roleTitle?: string;
  preferredContact?: ClientPreferredContact;
  typicalProjectArea?: string;
  defaultBudgetRange?: string;
  approvalContact?: string;
  billingEmail?: string;
  projectTypes?: string[];
  logoPath?: string | null;
  notifications?: ClientNotificationPreferences;
};

export const CLIENT_PROFILE_PREFERENCES_DEFAULTS: ClientProfilePreferences = {
  roleTitle: "",
  preferredContact: "Email",
  typicalProjectArea: "",
  defaultBudgetRange: "",
  approvalContact: "",
  billingEmail: "",
  projectTypes: [],
  logoPath: null,
  notifications: undefined,
};

const PREFERRED_CONTACTS = new Set<ClientPreferredContact>([
  "Email",
  "Phone",
  "Messages",
]);

export function parseClientProfilePreferences(
  json: string | null | undefined,
): ClientProfilePreferences {
  if (!json?.trim()) {
    return { ...CLIENT_PROFILE_PREFERENCES_DEFAULTS };
  }

  try {
    const parsed = JSON.parse(json) as Partial<ClientProfilePreferences>;
    const preferredContact = PREFERRED_CONTACTS.has(
      parsed.preferredContact as ClientPreferredContact,
    )
      ? parsed.preferredContact
      : CLIENT_PROFILE_PREFERENCES_DEFAULTS.preferredContact;

    return {
      ...CLIENT_PROFILE_PREFERENCES_DEFAULTS,
      ...parsed,
      preferredContact,
      projectTypes: Array.isArray(parsed.projectTypes)
        ? parsed.projectTypes.filter((item) => typeof item === "string")
        : [],
      notifications: normalizeNotificationPreferences(parsed.notifications),
    };
  } catch {
    return { ...CLIENT_PROFILE_PREFERENCES_DEFAULTS };
  }
}

export function serializeClientProfilePreferences(
  preferences: ClientProfilePreferences | null | undefined,
): string | null {
  if (!preferences) return null;

  const normalized = normalizeClientProfilePreferencesInput(preferences);
  const hasValue =
    Boolean(normalized.roleTitle?.trim()) ||
    Boolean(normalized.typicalProjectArea?.trim()) ||
    Boolean(normalized.defaultBudgetRange?.trim()) ||
    Boolean(normalized.approvalContact?.trim()) ||
    Boolean(normalized.billingEmail?.trim()) ||
    Boolean(normalized.logoPath) ||
    (normalized.projectTypes?.length ?? 0) > 0 ||
    normalized.preferredContact !== "Email" ||
    normalized.notifications != null;

  if (!hasValue) return null;
  return JSON.stringify(normalized);
}

export function mergeClientProfilePreferences(
  existingJson: string | null | undefined,
  patch: Partial<ClientProfilePreferences> | null | undefined,
): ClientProfilePreferences {
  const current = parseClientProfilePreferences(existingJson);
  if (!patch) return current;

  return normalizeClientProfilePreferencesInput({
    ...current,
    ...patch,
    notifications:
      patch.notifications !== undefined
        ? normalizeNotificationPreferences(patch.notifications)
        : current.notifications,
    projectTypes:
      patch.projectTypes !== undefined ? patch.projectTypes : current.projectTypes,
  });
}

export function normalizeClientProfilePreferencesInput(
  input: Partial<ClientProfilePreferences>,
): ClientProfilePreferences {
  const preferredContact = PREFERRED_CONTACTS.has(
    input.preferredContact as ClientPreferredContact,
  )
    ? input.preferredContact!
    : "Email";

  return {
    roleTitle: input.roleTitle?.trim() ?? "",
    preferredContact,
    typicalProjectArea: input.typicalProjectArea?.trim() ?? "",
    defaultBudgetRange: input.defaultBudgetRange?.trim() ?? "",
    approvalContact: input.approvalContact?.trim() ?? "",
    billingEmail: input.billingEmail?.trim() ?? "",
    projectTypes: Array.isArray(input.projectTypes)
      ? input.projectTypes.map((item) => item.trim()).filter(Boolean)
      : [],
    logoPath: input.logoPath ?? null,
    notifications: normalizeNotificationPreferences(input.notifications),
  };
}

function normalizeNotificationPreferences(
  input: Partial<ClientNotificationPreferences> | null | undefined,
): ClientNotificationPreferences | undefined {
  if (!input) return undefined;

  return {
    emailUpdates: input.emailUpdates ?? true,
    newBids: input.newBids ?? true,
    messages: input.messages ?? true,
    projectUpdates: input.projectUpdates ?? false,
  };
}
