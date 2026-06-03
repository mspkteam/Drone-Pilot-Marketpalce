export async function parseSupportCreateForm(formData: FormData) {
  const requesterName = String(formData.get("requesterName") ?? "").trim();
  const requesterEmail = String(formData.get("requesterEmail") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const file = formData.get("attachment");

  let attachment: {
    buffer: Buffer;
    mime: string;
    originalName: string;
  } | null = null;

  if (file instanceof File && file.size > 0) {
    attachment = {
      buffer: Buffer.from(await file.arrayBuffer()),
      mime: file.type || "application/octet-stream",
      originalName: file.name || "attachment",
    };
  }

  return { requesterName, requesterEmail, message, attachment };
}

export async function parseSupportMessageForm(formData: FormData) {
  const message = String(formData.get("message") ?? "").trim();
  const file = formData.get("attachment");

  let attachment: {
    buffer: Buffer;
    mime: string;
    originalName: string;
  } | null = null;

  if (file instanceof File && file.size > 0) {
    attachment = {
      buffer: Buffer.from(await file.arrayBuffer()),
      mime: file.type || "application/octet-stream",
      originalName: file.name || "attachment",
    };
  }

  return { message, attachment };
}
