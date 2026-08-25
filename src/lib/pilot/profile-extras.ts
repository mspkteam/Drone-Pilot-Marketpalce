export type PilotNotificationPreferences = {
  jobAlerts: boolean;
  messages: boolean;
  contracts: boolean;
  membership: boolean;
};

export const PILOT_NOTIFICATION_DEFAULTS: PilotNotificationPreferences = {
  jobAlerts: true,
  messages: true,
  contracts: true,
  membership: true,
};

export type PilotProfileExtras = {
  callSign: string;
  languages: string;
  mainDrones: string[];
  payloads: string[];
  localChipIds: string[];
  avatarUrl: string | null;
  notifications: PilotNotificationPreferences;
};

export const emptyPilotProfileExtras = (): PilotProfileExtras => ({
  callSign: "",
  languages: "",
  mainDrones: [],
  payloads: [],
  localChipIds: [],
  avatarUrl: null,
  notifications: { ...PILOT_NOTIFICATION_DEFAULTS },
});

const AVATAR_MAX_CHARS = 550_000;
const CALL_SIGN_MAX = 12;
const PAYLOAD_MAX = 22;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function parseNotifications(value: unknown): PilotNotificationPreferences {
  const source =
    value && typeof value === "object"
      ? (value as Partial<PilotNotificationPreferences>)
      : {};
  return {
    jobAlerts:
      typeof source.jobAlerts === "boolean"
        ? source.jobAlerts
        : PILOT_NOTIFICATION_DEFAULTS.jobAlerts,
    messages:
      typeof source.messages === "boolean"
        ? source.messages
        : PILOT_NOTIFICATION_DEFAULTS.messages,
    contracts:
      typeof source.contracts === "boolean"
        ? source.contracts
        : PILOT_NOTIFICATION_DEFAULTS.contracts,
    membership:
      typeof source.membership === "boolean"
        ? source.membership
        : PILOT_NOTIFICATION_DEFAULTS.membership,
  };
}

export function parseProfileExtrasJson(
  raw: string | null | undefined,
): PilotProfileExtras {
  const empty = emptyPilotProfileExtras();
  if (!raw?.trim()) return empty;
  try {
    const parsed = JSON.parse(raw) as Partial<PilotProfileExtras>;
    const avatarUrl =
      typeof parsed.avatarUrl === "string" && parsed.avatarUrl.trim()
        ? parsed.avatarUrl
        : null;
    return {
      callSign:
        typeof parsed.callSign === "string"
          ? parsed.callSign.slice(0, CALL_SIGN_MAX)
          : "",
      languages: typeof parsed.languages === "string" ? parsed.languages : "",
      mainDrones: asStringArray(parsed.mainDrones),
      payloads: asStringArray(parsed.payloads).map((item) =>
        item.slice(0, PAYLOAD_MAX),
      ),
      localChipIds: asStringArray(parsed.localChipIds),
      avatarUrl,
      notifications: parseNotifications(parsed.notifications),
    };
  } catch {
    return empty;
  }
}

export function serializeProfileExtrasJson(extras: PilotProfileExtras): string {
  return JSON.stringify({
    callSign: extras.callSign.trim().slice(0, CALL_SIGN_MAX),
    languages: extras.languages.trim(),
    mainDrones: extras.mainDrones.map((item) => item.trim()).filter(Boolean),
    payloads: extras.payloads
      .map((item) => item.trim().slice(0, PAYLOAD_MAX))
      .filter(Boolean),
    localChipIds: extras.localChipIds.filter(Boolean),
    avatarUrl: extras.avatarUrl,
    notifications: extras.notifications ?? { ...PILOT_NOTIFICATION_DEFAULTS },
  } satisfies PilotProfileExtras);
}

export function sanitizeProfileExtrasInput(
  value: unknown,
): PilotProfileExtras {
  if (!value || typeof value !== "object") {
    return emptyPilotProfileExtras();
  }
  return parseProfileExtrasJson(JSON.stringify(value));
}

export function mergePilotProfileExtras(
  current: PilotProfileExtras,
  incoming: PilotProfileExtras,
): PilotProfileExtras {
  const incomingRecord = incoming as unknown as Record<string, unknown>;
  const hasNotifications = Object.prototype.hasOwnProperty.call(
    incomingRecord,
    "notifications",
  );
  return {
    ...current,
    ...incoming,
    notifications: hasNotifications ? incoming.notifications : current.notifications,
  };
}

export function isAvatarPayloadTooLarge(avatarUrl: string | null): boolean {
  return Boolean(avatarUrl && avatarUrl.length > AVATAR_MAX_CHARS);
}

export function avatarUrlFromExtrasJson(
  json: string | null | undefined,
): string | null {
  return parseProfileExtrasJson(json).avatarUrl;
}
