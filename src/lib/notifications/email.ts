import { prisma } from "@/lib/db";

export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
};

export async function sendTransactionalEmail(payload: EmailPayload): Promise<boolean> {
  const from = process.env.EMAIL_FROM ?? "noreply@dronepilot.local";

  if (process.env.NODE_ENV === "production" && !process.env.SMTP_URL) {
    console.warn(
      "[email] SMTP_URL not configured — skipping send:",
      payload.subject,
      "→",
      payload.to,
    );
    return false;
  }

  console.info(
    `[email] ${from} → ${payload.to}\n  Subject: ${payload.subject}\n  ${payload.text}`,
  );
  return true;
}

export async function emailUser(
  userId: string,
  subject: string,
  text: string,
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user?.email) return false;
  return sendTransactionalEmail({ to: user.email, subject, text });
}
