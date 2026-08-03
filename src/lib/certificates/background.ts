import fs from "fs/promises";
import path from "path";

function resolveLocalPublicPath(backgroundImageUrl: string): string {
  const cleaned = backgroundImageUrl.replace(/^\//, "");
  const absolute = path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "public",
    cleaned,
  );
  return absolute;
}

function appBaseUrls(): string[] {
  const urls = new Set<string>();
  for (const value of [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    "http://localhost:3000",
  ]) {
    if (value?.trim()) {
      urls.add(value.trim().replace(/\/$/, ""));
    }
  }
  return [...urls];
}

function toAbsoluteAssetUrl(backgroundImageUrl: string, base: string): string {
  if (/^https?:\/\//i.test(backgroundImageUrl)) {
    return backgroundImageUrl;
  }
  return `${base}${backgroundImageUrl.startsWith("/") ? "" : "/"}${backgroundImageUrl}`;
}

/**
 * Load certificate background PNG for PDF rendering.
 * Absolute URLs (e.g. Vercel Blob) fetch directly; relative paths try local
 * public/ then deployed app URLs.
 */
export async function loadCertificateBackground(
  backgroundImageUrl: string | null | undefined,
): Promise<Buffer | null> {
  if (!backgroundImageUrl?.trim()) return null;

  if (/^https?:\/\//i.test(backgroundImageUrl)) {
    try {
      const response = await fetch(backgroundImageUrl, {
        cache: "force-cache",
      });
      if (response.ok) {
        return Buffer.from(await response.arrayBuffer());
      }
    } catch {
      // Fall through.
    }
    return null;
  }

  const localPath = resolveLocalPublicPath(backgroundImageUrl);
  try {
    return await fs.readFile(localPath);
  } catch {
    // Fall through to HTTP fetch.
  }

  for (const base of appBaseUrls()) {
    try {
      const response = await fetch(toAbsoluteAssetUrl(backgroundImageUrl, base), {
        cache: "force-cache",
      });
      if (!response.ok) continue;
      return Buffer.from(await response.arrayBuffer());
    } catch {
      // Try next base URL.
    }
  }

  return null;
}
