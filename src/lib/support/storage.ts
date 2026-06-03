import fs from "fs/promises";
import path from "path";
import {
  SUPPORT_ALLOWED_MIME_TYPES,
  SUPPORT_MAX_BYTES,
  SUPPORT_MIME_TO_EXT,
  type SupportMimeType,
} from "@/lib/support/constants";

const SUPPORT_DIR = path.join(process.cwd(), "storage", "support");

export function getSupportStorageDir() {
  return SUPPORT_DIR;
}

export function resolveSupportPath(fileName: string) {
  return path.join(SUPPORT_DIR, path.basename(fileName));
}

export async function ensureSupportStorageDir() {
  await fs.mkdir(SUPPORT_DIR, { recursive: true });
}

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
  await ensureSupportStorageDir();
  const fullPath = resolveSupportPath(fileName);
  await fs.writeFile(fullPath, buffer);
  return fileName;
}

export async function readSupportFile(fileName: string): Promise<Buffer> {
  return fs.readFile(resolveSupportPath(fileName));
}
