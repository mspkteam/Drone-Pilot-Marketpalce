import { writePublicAsset } from "@/lib/storage/public-asset";

/**
 * User-facing public images (avatars, logos, portfolio, job references).
 * Uses Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set.
 */

export const USER_IMAGE_KINDS = [
  "avatar",
  "logo",
  "portfolio",
  "job-reference",
  "message-attachment",
] as const;

export type UserImageKind = (typeof USER_IMAGE_KINDS)[number];

export const USER_IMAGE_MAX_BYTES: Record<UserImageKind, number> = {
  avatar: 10 * 1024 * 1024,
  logo: 10 * 1024 * 1024,
  portfolio: 10 * 1024 * 1024,
  "job-reference": 10 * 1024 * 1024,
  "message-attachment": 10 * 1024 * 1024,
};

/** Infer image mime when browsers leave File.type empty (common on mobile). */
export function sniffImageMime(
  buffer: Buffer,
  declaredMime: string,
): string {
  const declared = declaredMime?.trim().toLowerCase();
  if (declared && declared !== "application/octet-stream") {
    return declared;
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (buffer.length >= 6 && buffer.toString("ascii", 0, 3) === "GIF") {
    return "image/gif";
  }
  if (buffer.length >= 5 && buffer.toString("ascii", 0, 5) === "%PDF-") {
    return "application/pdf";
  }
  return declared || "application/octet-stream";
}

const IMAGE_EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const JOB_REF_EXT_BY_MIME: Record<string, string> = {
  ...IMAGE_EXT_BY_MIME,
  "application/pdf": "pdf",
};

const FOLDER_BY_KIND: Record<UserImageKind, string> = {
  avatar: "profiles/avatars",
  logo: "profiles/logos",
  portfolio: "portfolio",
  "job-reference": "jobs/references",
  "message-attachment": "messages/attachments",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function isUserImageKind(value: string): value is UserImageKind {
  return (USER_IMAGE_KINDS as readonly string[]).includes(value);
}

function allowsDocuments(kind: UserImageKind): boolean {
  return kind === "job-reference" || kind === "message-attachment";
}

export function validateUserImage(
  kind: UserImageKind,
  buffer: Buffer,
  mime: string,
): { ok: true } | { ok: false; error: string } {
  if (buffer.length === 0) {
    return { ok: false, error: "File is empty." };
  }
  const max = USER_IMAGE_MAX_BYTES[kind];
  if (buffer.length > max) {
    return {
      ok: false,
      error: `File must be ${Math.round(max / (1024 * 1024))} MB or smaller.`,
    };
  }
  const allowed = allowsDocuments(kind) ? JOB_REF_EXT_BY_MIME : IMAGE_EXT_BY_MIME;
  if (!(mime in allowed)) {
    return {
      ok: false,
      error: allowsDocuments(kind)
        ? "Allowed types: PNG, JPEG, WebP, GIF, or PDF."
        : "Allowed types: PNG, JPEG, WebP, or GIF.",
    };
  }
  return { ok: true };
}

export async function writeUserImage(input: {
  kind: UserImageKind;
  buffer: Buffer;
  mime: string;
  userId: string;
  nameHint?: string | null;
}): Promise<string> {
  const allowed = allowsDocuments(input.kind) ? JOB_REF_EXT_BY_MIME : IMAGE_EXT_BY_MIME;
  const ext = allowed[input.mime] ?? "jpg";
  const hint = input.nameHint ? slugify(input.nameHint) : "";
  const fileName = `${input.userId.slice(-8)}-${hint || input.kind}-${Date.now().toString(36)}.${ext}`;
  return writePublicAsset({
    folder: FOLDER_BY_KIND[input.kind],
    fileName,
    buffer: input.buffer,
    contentType: input.mime,
  });
}
