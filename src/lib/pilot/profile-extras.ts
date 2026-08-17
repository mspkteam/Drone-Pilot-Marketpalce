export type PilotProfileExtras = {
  callSign: string;
  languages: string;
  mainDrones: string[];
  payloads: string[];
  localChipIds: string[];
  avatarUrl: string | null;
};

export const emptyPilotProfileExtras = (): PilotProfileExtras => ({
  callSign: "",
  languages: "",
  mainDrones: [],
  payloads: [],
  localChipIds: [],
  avatarUrl: null,
});

const AVATAR_MAX_CHARS = 550_000;
const CALL_SIGN_MAX = 12;
const PAYLOAD_MAX = 22;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
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

export function isAvatarPayloadTooLarge(avatarUrl: string | null): boolean {
  return Boolean(avatarUrl && avatarUrl.length > AVATAR_MAX_CHARS);
}
