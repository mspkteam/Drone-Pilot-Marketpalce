import {
  DELIVERY_ALLOWED_MIME_TYPES,
  DELIVERY_MAX_BYTES,
  DELIVERY_MIME_TO_EXT,
  type DeliveryMimeType,
} from "@/lib/deliveries/constants";
import {
  readPrivateAsset,
  writePrivateAsset,
} from "@/lib/storage/private-asset";

const FOLDER = "deliveries";

export function isAllowedDeliveryMime(mime: string): mime is DeliveryMimeType {
  return (DELIVERY_ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}

export function buildStoredDeliveryFileName(
  itemId: string,
  mime: DeliveryMimeType,
) {
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
  return writePrivateAsset({
    folder: FOLDER,
    fileName,
    buffer,
  });
}

export async function readDeliveryFile(fileName: string): Promise<Buffer> {
  return readPrivateAsset(FOLDER, fileName);
}
