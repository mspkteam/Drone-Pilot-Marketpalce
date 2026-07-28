import { SUPPORT_MAX_ATTACHMENTS } from "@/lib/support/constants";

export type ParsedSupportAttachment = {
  buffer: Buffer;
  mime: string;
  originalName: string;
};

async function fileToAttachment(file: File): Promise<ParsedSupportAttachment> {
  return {
    buffer: Buffer.from(await file.arrayBuffer()),
    mime: file.type || "application/octet-stream",
    originalName: file.name || "attachment",
  };
}

function collectAttachmentFiles(formData: FormData): File[] {
  const multi = formData
    .getAll("attachments")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (multi.length > 0) return multi;

  const single = formData.get("attachment");
  if (single instanceof File && single.size > 0) return [single];
  return [];
}

export async function parseSupportAttachments(
  formData: FormData,
): Promise<
  | { ok: true; attachments: ParsedSupportAttachment[] }
  | { ok: false; error: string }
> {
  const files = collectAttachmentFiles(formData);
  if (files.length > SUPPORT_MAX_ATTACHMENTS) {
    return {
      ok: false,
      error: `You can attach up to ${SUPPORT_MAX_ATTACHMENTS} files.`,
    };
  }

  const attachments = await Promise.all(files.map(fileToAttachment));
  return { ok: true, attachments };
}

export async function parseSupportCreateForm(formData: FormData) {
  const requesterName = String(formData.get("requesterName") ?? "").trim();
  const requesterEmail = String(formData.get("requesterEmail") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const parsedFiles = await parseSupportAttachments(formData);
  if (!parsedFiles.ok) {
    return {
      requesterName,
      requesterEmail,
      message,
      attachments: [] as ParsedSupportAttachment[],
      attachmentError: parsedFiles.error,
    };
  }

  return {
    requesterName,
    requesterEmail,
    message,
    attachments: parsedFiles.attachments,
    /** @deprecated Prefer `attachments[0]` — kept for older call sites. */
    attachment: parsedFiles.attachments[0] ?? null,
    attachmentError: null as string | null,
  };
}

export async function parseSupportMessageForm(formData: FormData) {
  const message = String(formData.get("message") ?? "").trim();
  const parsedFiles = await parseSupportAttachments(formData);
  if (!parsedFiles.ok) {
    return {
      message,
      attachments: [] as ParsedSupportAttachment[],
      attachment: null,
      attachmentError: parsedFiles.error,
    };
  }

  return {
    message,
    attachments: parsedFiles.attachments,
    /** @deprecated Prefer `attachments[0]` — kept for older call sites. */
    attachment: parsedFiles.attachments[0] ?? null,
    attachmentError: null as string | null,
  };
}
