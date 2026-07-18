import fs from "fs/promises";
import path from "path";

/**
 * Wing artwork lives under /public/wings so it is served as a static asset at
 * `/wings/<file>`. Admins can either drop PNG files here manually (named after
 * the wing code, e.g. `aviator-wings-senior.png`) or upload through the Edit
 * modal, which writes the file here and stores the returned path on the wing.
 */
const WING_IMAGE_DIR = path.join(process.cwd(), "public", "wings");
const WING_IMAGE_PUBLIC_PREFIX = "/wings";

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
  await fs.mkdir(WING_IMAGE_DIR, { recursive: true });
  const ext = WING_IMAGE_EXT_BY_MIME[mime] ?? "png";
  const base = codeHint && slugify(codeHint) ? slugify(codeHint) : `wing-${Date.now()}`;
  const fileName = `${base}.${ext}`;
  await fs.writeFile(path.join(WING_IMAGE_DIR, fileName), buffer);
  return `${WING_IMAGE_PUBLIC_PREFIX}/${fileName}`;
}
