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
] as const;

export type UserImageKind = (typeof USER_IMAGE_KINDS)[number];

export const USER_IMAGE_MAX_BYTES: Record<UserImageKind, number> = {
  avatar: 2 * 1024 * 1024,
  logo: 2 * 1024 * 1024,
  portfolio: 5 * 1024 * 1024,
  "job-reference": 8 * 1024 * 1024,
};

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
  const allowed =
    kind === "job-reference" ? JOB_REF_EXT_BY_MIME : IMAGE_EXT_BY_MIME;
  if (!(mime in allowed)) {
    return {
      ok: false,
      error:
        kind === "job-reference"
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
  const allowed =
    input.kind === "job-reference" ? JOB_REF_EXT_BY_MIME : IMAGE_EXT_BY_MIME;
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
