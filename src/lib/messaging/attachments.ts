export type MessageAttachment = {
  url: string;
  name: string;
  contentType: string;
};

const MAX_ATTACHMENTS = 4;
const MAX_NAME = 120;

export function parseMessageAttachments(raw: string | null | undefined): MessageAttachment[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
      .map((item) => ({
        url: typeof item.url === "string" ? item.url.trim() : "",
        name: typeof item.name === "string" ? item.name.trim().slice(0, MAX_NAME) : "file",
        contentType:
          typeof item.contentType === "string" ? item.contentType : "application/octet-stream",
      }))
      .filter((item) => item.url.startsWith("https://") || item.url.startsWith("/"));
  } catch {
    return [];
  }
}

export function sanitizeMessageAttachments(value: unknown): MessageAttachment[] {
  if (!Array.isArray(value)) return [];
  return parseMessageAttachments(JSON.stringify(value)).slice(0, MAX_ATTACHMENTS);
}

export function serializeMessageAttachments(items: MessageAttachment[]): string | null {
  if (items.length === 0) return null;
  return JSON.stringify(items);
}
