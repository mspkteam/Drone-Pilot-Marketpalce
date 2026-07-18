import fs from "fs/promises";
import path from "path";

/**
 * CMS media (featured images and downloadable resource files) lives under
 * /public/cms so it is served as a static asset at `/cms/<file>`. Admins upload
 * through the article/resource editors, which write the file here and store the
 * returned path on the record.
 *
 * Note: on serverless hosts (Vercel) the filesystem is ephemeral — uploaded
 * files persist for local/dev and self-hosted deployments. Mirrors the wing
 * image storage pattern (`src/lib/wings/image-storage.ts`).
 */
const CMS_MEDIA_DIR = path.join(process.cwd(), "public", "cms");
const CMS_MEDIA_PUBLIC_PREFIX = "/cms";

export type CmsMediaKind = "image" | "file";

export const CMS_IMAGE_MAX_BYTES = 3 * 1024 * 1024;
export const CMS_FILE_MAX_BYTES = 15 * 1024 * 1024;

const IMAGE_EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
};

const FILE_EXT_BY_MIME: Record<string, string> = {
  ...IMAGE_EXT_BY_MIME,
  "application/pdf": "pdf",
};

function extMapFor(kind: CmsMediaKind): Record<string, string> {
  return kind === "image" ? IMAGE_EXT_BY_MIME : FILE_EXT_BY_MIME;
}

function maxBytesFor(kind: CmsMediaKind): number {
  return kind === "image" ? CMS_IMAGE_MAX_BYTES : CMS_FILE_MAX_BYTES;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export function validateCmsMedia(
  kind: CmsMediaKind,
  buffer: Buffer,
  mime: string,
): { ok: true } | { ok: false; error: string } {
  if (buffer.length === 0) {
    return { ok: false, error: "File is empty." };
  }
  const max = maxBytesFor(kind);
  if (buffer.length > max) {
    return {
      ok: false,
      error: `File must be ${Math.round(max / (1024 * 1024))} MB or smaller.`,
    };
  }
  if (!(mime in extMapFor(kind))) {
    return {
      ok: false,
      error:
        kind === "image"
          ? "Allowed image types: PNG, JPEG, WebP, GIF, or SVG."
          : "Allowed file types: PDF or image (PNG, JPEG, WebP, GIF, SVG).",
    };
  }
  return { ok: true };
}

export async function writeCmsMedia(
  kind: CmsMediaKind,
  buffer: Buffer,
  mime: string,
  nameHint?: string | null,
): Promise<string> {
  await fs.mkdir(CMS_MEDIA_DIR, { recursive: true });
  const ext = extMapFor(kind)[mime] ?? (kind === "image" ? "png" : "bin");
  const base =
    nameHint && slugify(nameHint) ? slugify(nameHint) : `cms-${kind}`;
  const fileName = `${base}-${Date.now().toString(36)}.${ext}`;
  await fs.writeFile(path.join(CMS_MEDIA_DIR, fileName), buffer);
  return `${CMS_MEDIA_PUBLIC_PREFIX}/${fileName}`;
}
