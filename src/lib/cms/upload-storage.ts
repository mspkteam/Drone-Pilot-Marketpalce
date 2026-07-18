import fs from "fs/promises";
import path from "path";

/**
 * CMS media lives under /public/cms so it is served as a static asset at
 * `/cms/<file>`. Admins upload featured images / Open Graph images and
 * downloadable resource files through the CMS editors, which write here and
 * store the returned public path on the article/resource record.
 *
 * Note: like the wing artwork store, files written at runtime persist on the
 * local disk. On ephemeral hosts commit assets to the repo (or point the URL
 * field at external storage) — same pattern as `lib/wings/image-storage.ts`.
 */
const CMS_UPLOAD_DIR = path.join(process.cwd(), "public", "cms");
const CMS_PUBLIC_PREFIX = "/cms";

export const CMS_IMAGE_MAX_BYTES = 4 * 1024 * 1024; // 4 MB
export const CMS_FILE_MAX_BYTES = 15 * 1024 * 1024; // 15 MB

const IMAGE_EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
};

/** Downloadable resource files — images plus common document formats. */
const ALLOWED_FILE_EXTS = new Set([
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "svg",
  "gif",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "ppt",
  "pptx",
  "txt",
  "zip",
]);

export function isAllowedCmsImageMime(mime: string): boolean {
  return mime in IMAGE_EXT_BY_MIME;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function extFromName(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop() ?? "").toLowerCase() : "";
}

export function validateCmsImage(
  buffer: Buffer,
  mime: string,
): { ok: true } | { ok: false; error: string } {
  if (buffer.length === 0) return { ok: false, error: "File is empty." };
  if (buffer.length > CMS_IMAGE_MAX_BYTES) {
    return {
      ok: false,
      error: `Image must be ${CMS_IMAGE_MAX_BYTES / (1024 * 1024)} MB or smaller.`,
    };
  }
  if (!isAllowedCmsImageMime(mime)) {
    return { ok: false, error: "Allowed image types: PNG, JPEG, WebP, GIF, or SVG." };
  }
  return { ok: true };
}

export function validateCmsFile(
  buffer: Buffer,
  fileName: string,
): { ok: true } | { ok: false; error: string } {
  if (buffer.length === 0) return { ok: false, error: "File is empty." };
  if (buffer.length > CMS_FILE_MAX_BYTES) {
    return {
      ok: false,
      error: `File must be ${CMS_FILE_MAX_BYTES / (1024 * 1024)} MB or smaller.`,
    };
  }
  const ext = extFromName(fileName);
  if (!ext || !ALLOWED_FILE_EXTS.has(ext)) {
    return {
      ok: false,
      error: "Allowed file types: PDF, images, Office docs, CSV, TXT, or ZIP.",
    };
  }
  return { ok: true };
}

async function writeAsset(
  buffer: Buffer,
  ext: string,
  hint?: string | null,
): Promise<string> {
  await fs.mkdir(CMS_UPLOAD_DIR, { recursive: true });
  const base = hint && slugify(hint) ? slugify(hint) : "cms";
  // Timestamp suffix avoids overwriting distinct uploads that share a slug.
  const fileName = `${base}-${Date.now()}.${ext}`;
  await fs.writeFile(path.join(CMS_UPLOAD_DIR, fileName), buffer);
  return `${CMS_PUBLIC_PREFIX}/${fileName}`;
}

export async function writeCmsImage(
  buffer: Buffer,
  mime: string,
  hint?: string | null,
): Promise<string> {
  const ext = IMAGE_EXT_BY_MIME[mime] ?? "png";
  return writeAsset(buffer, ext, hint);
}

export async function writeCmsFile(
  buffer: Buffer,
  fileName: string,
  hint?: string | null,
): Promise<string> {
  const ext = extFromName(fileName) || "bin";
  return writeAsset(buffer, ext, hint);
}
