import { sendTransactionalEmail } from "@/lib/notifications/email";

export type ContactMessageInput = {
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  subject: string;
  message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactMessageInput(
  body: unknown,
):
  | { ok: true; data: ContactMessageInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  const record = body as Record<string, unknown>;
  const fullName = String(record.fullName ?? "").trim();
  const email = String(record.email ?? "").trim();
  const phone = String(record.phone ?? "").trim();
  const role = String(record.role ?? "").trim();
  const subject = String(record.subject ?? "").trim();
  const message = String(record.message ?? "").trim();

  if (!fullName) return { ok: false, error: "Full name is required." };
  if (!email || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "A valid email is required." };
  }
  if (!subject) return { ok: false, error: "Subject is required." };
  if (!message) return { ok: false, error: "Message is required." };

  return {
    ok: true,
    data: {
      fullName,
      email,
      phone: phone || undefined,
      role: role || "client",
      subject,
      message,
    },
  };
}

export async function submitContactMessage(
  input: ContactMessageInput,
): Promise<void> {
  const inbox =
    process.env.CONTACT_INBOX_EMAIL?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    "support@remoteairservice.com";

  const text = [
    `Name: ${input.fullName}`,
    `Email: ${input.email}`,
    `Role: ${input.role}`,
    input.phone ? `Phone: ${input.phone}` : null,
    "",
    input.message,
  ]
    .filter((line) => line != null)
    .join("\n");

  await sendTransactionalEmail({
    to: inbox,
    subject: `[Contact] ${input.subject}`,
    text,
  });
}
