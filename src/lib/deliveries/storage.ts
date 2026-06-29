import fs from "fs/promises";
import path from "path";
import {
  DELIVERY_ALLOWED_MIME_TYPES,
  DELIVERY_MAX_BYTES,
  DELIVERY_MIME_TO_EXT,
  type DeliveryMimeType,
} from "@/lib/deliveries/constants";

const DELIVERY_DIR = path.join(process.cwd(), "storage", "deliveries");

export function getDeliveryStorageDir() {
  return DELIVERY_DIR;
}

export function resolveDeliveryPath(fileName: string) {
  return path.join(DELIVERY_DIR, path.basename(fileName));
}

export async function ensureDeliveryStorageDir() {
  await fs.mkdir(DELIVERY_DIR, { recursive: true });
}

export function isAllowedDeliveryMime(mime: string): mime is DeliveryMimeType {
  return (DELIVERY_ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}

export function buildStoredDeliveryFileName(itemId: string, mime: DeliveryMimeType) {
  return `${itemId}.${DELIVERY_MIME_TO_EXT[mime]}`;
}

export function validateDeliveryFileBuffer(
  buffer: Buffer,
  mime: string,
): { ok: true; mime: DeliveryMimeType } | { ok: false; error: string } {
  if (buffer.length === 0) {
    return { ok: false, error: "File is empty." };
  }
  if (buffer.length > DELIVERY_MAX_BYTES) {
    return {
      ok: false,
      error: `File must be ${DELIVERY_MAX_BYTES / (1024 * 1024)} MB or smaller.`,
    };
  }
  if (!isAllowedDeliveryMime(mime)) {
    return {
      ok: false,
      error: "Allowed types: PDF, JPEG, PNG, WebP, MP4, or ZIP.",
    };
  }
  return { ok: true, mime };
}

export async function writeDeliveryFile(
  fileName: string,
  buffer: Buffer,
): Promise<string> {
  await ensureDeliveryStorageDir();
  const fullPath = resolveDeliveryPath(fileName);
  await fs.writeFile(fullPath, buffer);
  return fileName;
}

export async function readDeliveryFile(fileName: string): Promise<Buffer> {
  return fs.readFile(resolveDeliveryPath(fileName));
}
