import { writePublicAsset } from "@/lib/storage/public-asset";

/**
 * CMS media (featured images and resource files).
 * Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set; otherwise /public/cms.
 */

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
  const ext = extMapFor(kind)[mime] ?? (kind === "image" ? "png" : "bin");
  const base =
    nameHint && slugify(nameHint) ? slugify(nameHint) : `cms-${kind}`;
  const fileName = `${base}-${Date.now().toString(36)}.${ext}`;
  return writePublicAsset({
    folder: "cms",
    fileName,
    buffer,
    contentType: mime,
  });
}
