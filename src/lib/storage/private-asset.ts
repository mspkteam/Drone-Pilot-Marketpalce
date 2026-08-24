import { del, get, put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";
import { isBlobStorageConfigured } from "@/lib/storage/public-asset";

export type WritePrivateAssetInput = {
  /** Prefix under the store / local `storage/` dir, e.g. `support`. */
  folder: string;
  fileName: string;
  buffer: Buffer;
  contentType?: string;
};

export type BlobStoreAccess = "public" | "private";

/**
 * Blob store access mode. Vercel Blob stores are created as public or private
 * and cannot be switched afterward.
 *
 * Default `public` matches the existing `drone-pilot-marketpalce-blob` store.
 * Set `BLOB_ACCESS_MODE=private` only if the token points at a private store.
 *
 * App routes still gate downloads (support, verifications, deliveries, PDFs);
 * with a public store the blob URL itself is fetchable if known.
 */
export function getBlobStoreAccess(): BlobStoreAccess {
  const mode = process.env.BLOB_ACCESS_MODE?.trim().toLowerCase();
  return mode === "private" ? "private" : "public";
}

function blobToken(): string {
  return process.env.BLOB_READ_WRITE_TOKEN!.trim();
}

function safeFileName(fileName: string): string {
  return path.basename(fileName);
}

function localDir(folder: string): string {
  return path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "storage",
    ...folder.replace(/^\/+|\/+$/g, "").split("/"),
  );
}

async function streamToBuffer(
  stream: ReadableStream<Uint8Array>,
): Promise<Buffer> {
  return Buffer.from(await new Response(stream).arrayBuffer());
}

/**
 * Persist a sensitive app file (support, verification, deliveries, issued PDFs).
 * Blob when `BLOB_READ_WRITE_TOKEN` is set; otherwise `storage/<folder>/`.
 * Returns the stored file name (same contract as the legacy disk helpers).
 */
export async function writePrivateAsset(
  input: WritePrivateAssetInput,
): Promise<string> {
  const fileName = safeFileName(input.fileName);
  const folder = input.folder.replace(/^\/+|\/+$/g, "");
  const pathname = `${folder}/${fileName}`;

  if (isBlobStorageConfigured()) {
    try {
      await put(pathname, input.buffer, {
        access: getBlobStoreAccess(),
        addRandomSuffix: false,
        allowOverwrite: true,
        token: blobToken(),
        ...(input.contentType ? { contentType: input.contentType } : {}),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown storage error.";
      throw new Error(`File storage failed: ${message}`);
    }
    return fileName;
  }

  const dir = localDir(folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, fileName), input.buffer);
  return fileName;
}

/**
 * Read a private file by folder + file name.
 * Tries Blob first when configured, then falls back to local disk
 * (so older local files still resolve after enabling Blob).
 */
export async function readPrivateAsset(
  folder: string,
  fileName: string,
): Promise<Buffer> {
  const safe = safeFileName(fileName);
  const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
  const pathname = `${cleanFolder}/${safe}`;

  if (isBlobStorageConfigured()) {
    try {
      const result = await get(pathname, {
        access: getBlobStoreAccess(),
        useCache: false,
        token: blobToken(),
      });
      if (result?.statusCode === 200 && result.stream) {
        return streamToBuffer(result.stream);
      }
    } catch {
      // Fall through to local disk for pre-Blob files.
    }
  }

  return fs.readFile(path.join(localDir(cleanFolder), safe));
}

/** Best-effort delete of a stored file (Blob and/or local disk). */
export async function deletePrivateAsset(
  folder: string,
  fileName: string,
): Promise<void> {
  const safe = safeFileName(fileName);
  const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
  const pathname = `${cleanFolder}/${safe}`;

  if (isBlobStorageConfigured()) {
    try {
      await del(pathname, { token: blobToken() });
    } catch {
      /* already gone or not on Blob */
    }
  }

  try {
    await fs.unlink(path.join(localDir(cleanFolder), safe));
  } catch {
    /* already gone or never on disk */
  }
}
