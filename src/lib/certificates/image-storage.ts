import fs from "fs/promises";
import path from "path";

/**
 * Certificate artwork under /public/certificates — served at `/certificates/<file>`.
 * Seeded RAS fillables live here; admin uploads write additional custom backgrounds.
 */
const CERT_IMAGE_DIR = path.join(process.cwd(), "public", "certificates");
const CERT_IMAGE_PUBLIC_PREFIX = "/certificates";

export const CERT_IMAGE_MAX_BYTES = 8 * 1024 * 1024;

const CERT_IMAGE_EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export function isAllowedCertImageMime(mime: string): boolean {
  return mime in CERT_IMAGE_EXT_BY_MIME;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export function validateCertificateImage(
  buffer: Buffer,
  mime: string,
): { ok: true } | { ok: false; error: string } {
  if (buffer.length === 0) {
    return { ok: false, error: "File is empty." };
  }
  if (buffer.length > CERT_IMAGE_MAX_BYTES) {
    return {
      ok: false,
      error: `Image must be ${CERT_IMAGE_MAX_BYTES / (1024 * 1024)} MB or smaller.`,
    };
  }
  if (!isAllowedCertImageMime(mime)) {
    return { ok: false, error: "Allowed types: PNG, JPEG, or WebP." };
  }
  return { ok: true };
}

export async function writeCertificateBackgroundImage(
  buffer: Buffer,
  mime: string,
  nameHint?: string | null,
): Promise<string> {
  await fs.mkdir(CERT_IMAGE_DIR, { recursive: true });
  const ext = CERT_IMAGE_EXT_BY_MIME[mime] ?? "png";
  const base =
    nameHint && slugify(nameHint)
      ? `custom-${slugify(nameHint)}-${Date.now()}`
      : `custom-${Date.now()}`;
  const fileName = `${base}.${ext}`;
  await fs.writeFile(path.join(CERT_IMAGE_DIR, fileName), buffer);
  return `${CERT_IMAGE_PUBLIC_PREFIX}/${fileName}`;
}
