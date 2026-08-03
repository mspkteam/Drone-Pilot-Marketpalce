import { writePublicAsset } from "@/lib/storage/public-asset";

/**
 * Wing artwork: seed/manual files under /public/wings; admin uploads use
 * Vercel Blob when configured, else local public/.
 */

export const WING_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

const WING_IMAGE_EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export function isAllowedWingImageMime(mime: string): boolean {
  return mime in WING_IMAGE_EXT_BY_MIME;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export function validateWingImage(
  buffer: Buffer,
  mime: string,
): { ok: true } | { ok: false; error: string } {
  if (buffer.length === 0) {
    return { ok: false, error: "File is empty." };
  }
  if (buffer.length > WING_IMAGE_MAX_BYTES) {
    return {
      ok: false,
      error: `Image must be ${WING_IMAGE_MAX_BYTES / (1024 * 1024)} MB or smaller.`,
    };
  }
  if (!isAllowedWingImageMime(mime)) {
    return { ok: false, error: "Allowed types: PNG, JPEG, WebP, or SVG." };
  }
  return { ok: true };
}

export async function writeWingImage(
  buffer: Buffer,
  mime: string,
  codeHint?: string | null,
): Promise<string> {
  const ext = WING_IMAGE_EXT_BY_MIME[mime] ?? "png";
  const base =
    codeHint && slugify(codeHint) ? slugify(codeHint) : `wing-${Date.now()}`;
  const fileName = `${base}.${ext}`;
  return writePublicAsset({
    folder: "wings",
    fileName,
    buffer,
    contentType: mime,
  });
}
