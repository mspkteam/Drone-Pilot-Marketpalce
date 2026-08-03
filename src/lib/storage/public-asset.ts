import { put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

/**
 * Public media uploads (certificates, wings, shop, CMS).
 * Uses Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set (production);
 * otherwise writes under `/public` for local/dev.
 */
export function isBlobStorageConfigured(): boolean {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  // `vercel env pull` may write the literal placeholder `[SENSITIVE]`.
  return Boolean(token && token !== "[SENSITIVE]");
}

function blobToken(): string {
  return process.env.BLOB_READ_WRITE_TOKEN!.trim();
}

export type WritePublicAssetInput = {
  /** Path prefix inside the store / public folder, e.g. `certificates` or `shop/products`. */
  folder: string;
  fileName: string;
  buffer: Buffer;
  contentType: string;
};

/**
 * Persist a public asset and return a URL usable in `<img src>` / DB fields.
 * Blob → absolute `https://…public.blob.vercel-storage.com/…`
 * Local → relative `/folder/file.ext`
 */
export async function writePublicAsset(
  input: WritePublicAssetInput,
): Promise<string> {
  const folder = input.folder.replace(/^\/+|\/+$/g, "");
  const pathname = `${folder}/${input.fileName}`;

  if (isBlobStorageConfigured()) {
    const blob = await put(pathname, input.buffer, {
      access: "public",
      contentType: input.contentType,
      addRandomSuffix: false,
      // Explicit token — avoids OIDC-only failures in local/dev.
      token: blobToken(),
    });
    return blob.url;
  }

  const dir = path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "public",
    ...folder.split("/"),
  );
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, input.fileName), input.buffer);
  return `/${pathname}`;
}
