import { get, put } from "@vercel/blob";
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
 * Persist a private file (support, verification, deliveries, issued PDFs).
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
    await put(pathname, input.buffer, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      token: blobToken(),
      ...(input.contentType ? { contentType: input.contentType } : {}),
    });
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
        access: "private",
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
