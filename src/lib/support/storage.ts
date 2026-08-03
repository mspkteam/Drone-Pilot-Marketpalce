import {
  SUPPORT_ALLOWED_MIME_TYPES,
  SUPPORT_MAX_BYTES,
  SUPPORT_MIME_TO_EXT,
  type SupportMimeType,
} from "@/lib/support/constants";
import {
  readPrivateAsset,
  writePrivateAsset,
} from "@/lib/storage/private-asset";

const FOLDER = "support";

export function isAllowedSupportMime(mime: string): mime is SupportMimeType {
  return (SUPPORT_ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}

export function buildSupportFileName(messageId: string, mime: SupportMimeType) {
  return `${messageId}.${SUPPORT_MIME_TO_EXT[mime]}`;
}

export function validateSupportFileBuffer(
  buffer: Buffer,
  mime: string,
): { ok: true; mime: SupportMimeType } | { ok: false; error: string } {
  if (buffer.length === 0) {
    return { ok: false, error: "File is empty." };
  }
  if (buffer.length > SUPPORT_MAX_BYTES) {
    return {
      ok: false,
      error: `File must be ${SUPPORT_MAX_BYTES / (1024 * 1024)} MB or smaller.`,
    };
  }
  if (!isAllowedSupportMime(mime)) {
    return {
      ok: false,
      error: "Allowed types: JPEG, PNG, WebP, or PDF.",
    };
  }
  return { ok: true, mime };
}

export async function writeSupportFile(
  fileName: string,
  buffer: Buffer,
): Promise<string> {
  return writePrivateAsset({
    folder: FOLDER,
    fileName,
    buffer,
  });
}

export async function readSupportFile(fileName: string): Promise<Buffer> {
  return readPrivateAsset(FOLDER, fileName);
}
