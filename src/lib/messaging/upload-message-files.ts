import { uploadUserImage } from "@/lib/storage/upload-browser";

export type UploadedMessageFile = {
  url: string;
  name: string;
  contentType: string;
};

export async function uploadMessageFiles(
  files: File[],
): Promise<{ ok: true; attachments: UploadedMessageFile[] } | { ok: false; error: string }> {
  const attachments: UploadedMessageFile[] = [];
  for (const file of files) {
    const result = await uploadUserImage({ kind: "message-attachment", file });
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    attachments.push({
      url: result.url,
      name: file.name,
      contentType: file.type || "application/octet-stream",
    });
  }
  return { ok: true, attachments };
}
