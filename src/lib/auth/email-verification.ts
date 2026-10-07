import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import {
  isDeliverableEmailAddress,
  sendTransactionalEmail,
} from "@/lib/notifications/email";

const TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function appBaseUrl(): string {
  const raw =
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "http://localhost:3000";
  if (raw.startsWith("http")) return raw.replace(/\/$/, "");
  return `https://${raw.replace(/\/$/, "")}`;
}

export async function createAndSendEmailVerification(
  userId: string,
  email: string,
): Promise<{ sent: boolean; autoVerified: boolean; verifyUrl?: string }> {
  // Seed/QA inboxes cannot receive mail — mark verified so local testing works.
  if (!isDeliverableEmailAddress(email)) {
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    });
    return { sent: false, autoVerified: true };
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.emailVerificationToken.deleteMany({ where: { userId } });
  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  const verifyUrl = `${appBaseUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  const sent = await sendTransactionalEmail({
    to: email,
    subject: "Confirm your Remote Air Service email",
    text: [
      "Welcome to Remote Air Service.",
      "",
      "Confirm your email to continue creating your profile:",
      verifyUrl,
      "",
      "This link expires in 48 hours. If you did not create an account, ignore this message.",
    ].join("\n"),
  });

  return { sent, autoVerified: false, verifyUrl };
}

export async function verifyEmailToken(
  token: string,
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const tokenHash = hashToken(token.trim());
  const row = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true, emailVerifiedAt: true } } },
  });

  if (!row) {
    return { ok: false, error: "Invalid or expired verification link." };
  }
  if (row.expiresAt.getTime() < Date.now()) {
    await prisma.emailVerificationToken.delete({ where: { id: row.id } });
    return { ok: false, error: "This verification link has expired. Register again or request a new link." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: row.userId } }),
  ]);

  return { ok: true, email: row.user.email };
}

export async function resendEmailVerification(
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, email: true, emailVerifiedAt: true },
  });
  if (!user) {
    return { ok: true }; // do not leak existence
  }
  if (user.emailVerifiedAt) {
    return { ok: false, error: "This email is already verified. You can log in." };
  }
  await createAndSendEmailVerification(user.id, user.email);
  return { ok: true };
}
