import fs from "fs/promises";
import path from "path";
import {
  VERIFICATION_ALLOWED_MIME_TYPES,
  VERIFICATION_MIME_TO_EXT,
  VERIFICATION_MAX_BYTES,
  type VerificationMimeType,
} from "@/lib/verification/constants";

const VERIFICATION_DIR = path.join(process.cwd(), "storage", "verifications");

export function getVerificationStorageDir() {
  return VERIFICATION_DIR;
}

export function resolveVerificationPath(fileName: string) {
  const safe = path.basename(fileName);
  return path.join(VERIFICATION_DIR, safe);
}

export async function ensureVerificationStorageDir() {
  await fs.mkdir(VERIFICATION_DIR, { recursive: true });
}

export function isAllowedVerificationMime(
  mime: string,
): mime is VerificationMimeType {
  return (VERIFICATION_ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}

export function extensionForMime(mime: VerificationMimeType): string {
  return VERIFICATION_MIME_TO_EXT[mime];
}

export function buildStoredFileName(verificationId: string, mime: VerificationMimeType) {
  return `${verificationId}.${extensionForMime(mime)}`;
}

export function validateVerificationFileBuffer(
  buffer: Buffer,
  mime: string,
): { ok: true; mime: VerificationMimeType } | { ok: false; error: string } {
  if (buffer.length === 0) {
    return { ok: false, error: "File is empty." };
  }
  if (buffer.length > VERIFICATION_MAX_BYTES) {
    return {
      ok: false,
      error: `File must be ${VERIFICATION_MAX_BYTES / (1024 * 1024)} MB or smaller.`,
    };
  }
  if (!isAllowedVerificationMime(mime)) {
    return {
      ok: false,
      error: "Allowed types: PDF, JPEG, PNG, or WebP.",
    };
  }
  return { ok: true, mime };
}

export async function writeVerificationFile(
  fileName: string,
  buffer: Buffer,
): Promise<string> {
  await ensureVerificationStorageDir();
  const fullPath = resolveVerificationPath(fileName);
  await fs.writeFile(fullPath, buffer);
  return fileName;
}

export async function readVerificationFile(fileName: string): Promise<Buffer> {
  const fullPath = resolveVerificationPath(fileName);
  return fs.readFile(fullPath);
}
