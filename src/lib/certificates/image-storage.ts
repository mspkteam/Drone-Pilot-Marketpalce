import { writePublicAsset } from "@/lib/storage/public-asset";

/**
 * Certificate artwork: seeded fillables under /public/certificates;
 * admin uploads go to Vercel Blob when configured, else local public/.
 */

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
  const ext = CERT_IMAGE_EXT_BY_MIME[mime] ?? "png";
  const base =
    nameHint && slugify(nameHint)
      ? `custom-${slugify(nameHint)}-${Date.now()}`
      : `custom-${Date.now()}`;
  const fileName = `${base}.${ext}`;
  return writePublicAsset({
    folder: "certificates",
    fileName,
    buffer,
    contentType: mime,
  });
}
