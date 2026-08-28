import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";
import { getSmtpConfig, isEmailDeliveryConfigured } from "@/lib/notifications/smtp-config";

export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
};

export async function sendTransactionalEmail(payload: EmailPayload): Promise<boolean> {
  const smtp = getSmtpConfig();

  if (!smtp) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[email] SMTP not configured — skipping send:",
        payload.subject,
        "→",
        payload.to,
      );
      return false;
    }

    console.info(
      `[email] (dev log) ${process.env.EMAIL_FROM ?? "noreply@dronepilot.local"} → ${payload.to}\n  Subject: ${payload.subject}\n  ${payload.text}`,
    );
    return true;
  }

  try {
    const transport = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.password,
      },
    });

    await transport.sendMail({
      from: smtp.from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
    });

    console.info(`[email] sent ${payload.subject} → ${payload.to}`);
    return true;
  } catch (error) {
    console.error("[email] SMTP send failed:", error);
    return false;
  }
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

export { isEmailDeliveryConfigured };
