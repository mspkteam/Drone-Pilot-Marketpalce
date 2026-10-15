import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import {
  isDeliverableEmailAddress,
  isEmailDeliveryConfigured,
  sendTransactionalEmail,
} from "@/lib/notifications/email";

const TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Public site origin for verification links and post-verify redirects. */
export function appBaseUrl(request?: Request): string {
  const raw =
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    (request ? new URL(request.url).origin : "") ||
    "http://localhost:3000";
  if (raw.startsWith("http")) return raw.replace(/\/$/, "");
  return `https://${raw.replace(/\/$/, "")}`;
}

function verificationEmailBodies(verifyUrl: string): { text: string; html: string } {
  const text = [
    "Welcome to Remote Air Service.",
    "",
    "Confirm your email to continue creating your profile:",
    verifyUrl,
    "",
    "This link expires in 48 hours. If you did not create an account, ignore this message.",
  ].join("\n");

  const safeUrl = verifyUrl
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0b0b0b;font-family:Arial,Helvetica,sans-serif;color:#f5f5f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b0b;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background:#141414;border:1px solid #2a2a2a;border-radius:8px;padding:28px;">
        <tr><td>
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#d8b339;">Remote Air Service</p>
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#ffffff;">Confirm your email</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#d0d0d0;">
            Welcome aboard. Confirm your email to continue creating your profile.
          </p>
          <p style="margin:0 0 24px;">
            <a href="${safeUrl}" style="display:inline-block;background:#d8b339;color:#111111;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:4px;">
              Confirm email
            </a>
          </p>
          <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#a0a0a0;">
            Or paste this link into your browser:
          </p>
          <p style="margin:0 0 20px;font-size:12px;line-height:1.5;word-break:break-all;color:#d8b339;">${safeUrl}</p>
          <p style="margin:0;font-size:12px;line-height:1.5;color:#777777;">
            This link expires in 48 hours. If you did not create an account, you can ignore this message.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { text, html };
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

  // Hit the API GET directly so confirmation is server-side and idempotent
  // (avoids client double-POST showing "invalid" after a successful verify).
  const verifyUrl = `${appBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  const { text, html } = verificationEmailBodies(verifyUrl);
  const sent = await sendTransactionalEmail({
    to: email,
    subject: "Confirm your Remote Air Service email",
    text,
    html,
  });

  return { sent, autoVerified: false, verifyUrl };
}

export type VerifyEmailResult =
  | { ok: true; email: string; newlyVerified: boolean }
  | { ok: false; error: string };

/**
 * Confirm email from a one-time link. Idempotent: re-opening the same link
 * after success returns ok without erroring (welcome must only fire once).
 */
export async function verifyEmailToken(token: string): Promise<VerifyEmailResult> {
  const raw = token.trim();
  if (!raw) {
    return { ok: false, error: "Missing verification token." };
  }

  const tokenHash = hashToken(raw);
  const row = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: {
      user: { select: { id: true, email: true, emailVerifiedAt: true } },
    },
  });

  if (!row) {
    return { ok: false, error: "Invalid or expired verification link." };
  }

  if (row.expiresAt.getTime() < Date.now()) {
    await prisma.emailVerificationToken.delete({ where: { id: row.id } });
    return {
      ok: false,
      error:
        "This verification link has expired. Request a new confirmation email from the login page.",
    };
  }

  // Already confirmed (email client prefetch, double-click, Strict Mode remount).
  if (row.user.emailVerifiedAt) {
    return { ok: true, email: row.user.email, newlyVerified: false };
  }

  await prisma.user.update({
    where: { id: row.userId },
    data: { emailVerifiedAt: new Date() },
  });

  // Keep the token until expiry so repeat clicks stay idempotent.
  // Resend replaces tokens via deleteMany.

  return { ok: true, email: row.user.email, newlyVerified: true };
}

export async function resendEmailVerification(
  email: string,
): Promise<
  | { ok: true; emailSent: boolean; message: string }
  | { ok: false; error: string }
> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, email: true, emailVerifiedAt: true },
  });
  if (!user) {
    // Do not leak existence
    return {
      ok: true,
      emailSent: true,
      message:
        "If an unverified account exists for that email, a new link was sent.",
    };
  }
  if (user.emailVerifiedAt) {
    return { ok: false, error: "This email is already verified. You can log in." };
  }

  if (
    isDeliverableEmailAddress(user.email) &&
    process.env.NODE_ENV === "production" &&
    !isEmailDeliveryConfigured()
  ) {
    return {
      ok: false,
      error:
        "Email delivery is temporarily unavailable. Please try again shortly or contact support.",
    };
  }

  const verification = await createAndSendEmailVerification(user.id, user.email);
  if (!verification.sent && !verification.autoVerified) {
    return {
      ok: false,
      error:
        "We could not send the confirmation email. Check your address and try again in a minute.",
    };
  }

  return {
    ok: true,
    emailSent: verification.sent || verification.autoVerified,
    message: "Verification email sent. Check your inbox and spam folder.",
  };
}
