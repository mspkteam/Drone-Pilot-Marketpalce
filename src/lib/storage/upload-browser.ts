import type { UserImageKind } from "@/lib/storage/user-image";

/** Browser helper — uploads a File (or canvas data URL) to Blob-backed storage. */
export async function uploadUserImage(input: {
  kind: UserImageKind;
  file?: File;
  dataUrl?: string;
  name?: string;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    if (input.file) {
      const form = new FormData();
      form.set("kind", input.kind);
      form.set("file", input.file);
      const res = await fetch("/api/uploads/image", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        return { ok: false, error: data.error ?? "Upload failed." };
      }
      return { ok: true, url: data.url };
    }

    if (input.dataUrl) {
      const match = /^data:([^;]+);base64,(.+)$/s.exec(input.dataUrl);
      if (!match) {
        return { ok: false, error: "Invalid image data." };
      }
      const res = await fetch("/api/uploads/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: input.kind,
          mimeType: match[1],
          dataBase64: match[2],
          name: input.name ?? `${input.kind}.jpg`,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        return { ok: false, error: data.error ?? "Upload failed." };
      }
      return { ok: true, url: data.url };
    }

    return { ok: false, error: "No file provided." };
  } catch {
    return { ok: false, error: "Upload failed." };
  }
}
