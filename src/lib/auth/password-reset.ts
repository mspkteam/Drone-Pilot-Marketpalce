import { createHash, randomBytes } from "crypto";
import { appBaseUrl } from "@/lib/auth/email-verification";
import { hashPassword } from "@/lib/auth/password";
import { validatePasswordStrength } from "@/lib/auth/validation";
import { prisma } from "@/lib/db";
import {
  isDeliverableEmailAddress,
  isEmailDeliveryConfigured,
  sendTransactionalEmail,
} from "@/lib/notifications/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const GENERIC_REQUEST_MESSAGE =
  "If an account exists for that email, a password reset link was sent. Check your inbox and spam folder.";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function resetEmailBodies(resetUrl: string): { text: string; html: string } {
  const text = [
    "Remote Air Service — password reset",
    "",
    "We received a request to reset your password. Use this link within 1 hour:",
    resetUrl,
    "",
    "If you did not request a reset, you can ignore this message. Your password will stay the same.",
  ].join("\n");

  const safeUrl = resetUrl
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
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#ffffff;">Reset your password</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#d0d0d0;">
            We received a request to reset your password. This link expires in 1 hour.
          </p>
          <p style="margin:0 0 24px;">
            <a href="${safeUrl}" style="display:inline-block;background:#d8b339;color:#111111;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:4px;">
              Choose a new password
            </a>
          </p>
          <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#a0a0a0;">
            Or paste this link into your browser:
          </p>
          <p style="margin:0 0 20px;font-size:12px;line-height:1.5;word-break:break-all;color:#d8b339;">${safeUrl}</p>
          <p style="margin:0;font-size:12px;line-height:1.5;color:#777777;">
            If you did not request a reset, ignore this message. Your password will stay the same.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { text, html };
}

export type RequestPasswordResetResult =
  | { ok: true; message: string; resetUrl?: string }
  | { ok: false; error: string };

/**
 * Creates a one-time reset token and emails the link.
 * Always returns a generic success message when the email is unknown (no account leak).
 */
export async function requestPasswordReset(
  emailRaw: string,
): Promise<RequestPasswordResetResult> {
  const email = emailRaw.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, status: true },
  });

  if (!user) {
    return { ok: true, message: GENERIC_REQUEST_MESSAGE };
  }

  if (user.status === "suspended") {
    // Same generic copy — do not confirm suspension via this endpoint.
    return { ok: true, message: GENERIC_REQUEST_MESSAGE };
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

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const resetUrl = `${appBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;

  if (!isDeliverableEmailAddress(user.email)) {
    console.info(
      `[password-reset] seed/QA inbox — reset link for ${user.email}: ${resetUrl}`,
    );
    return {
      ok: true,
      message: GENERIC_REQUEST_MESSAGE,
      ...(process.env.NODE_ENV !== "production" ? { resetUrl } : {}),
    };
  }

  const { text, html } = resetEmailBodies(resetUrl);
  const sent = await sendTransactionalEmail({
    to: user.email,
    subject: "Reset your Remote Air Service password",
    text,
    html,
  });

  if (!sent) {
    return {
      ok: false,
      error:
        "We could not send the reset email. Check your address and try again in a minute.",
    };
  }

  return {
    ok: true,
    message: GENERIC_REQUEST_MESSAGE,
    ...(process.env.NODE_ENV !== "production" ? { resetUrl } : {}),
  };
}

export type ConfirmPasswordResetResult =
  | { ok: true; email: string }
  | { ok: false; error: string };

export async function confirmPasswordReset(input: {
  token: string;
  password: string;
}): Promise<ConfirmPasswordResetResult> {
  const raw = input.token?.trim() ?? "";
  if (!raw) {
    return { ok: false, error: "Missing reset token. Request a new link from the login page." };
  }

  const passwordCheck = validatePasswordStrength(input.password ?? "");
  if (!passwordCheck.ok) {
    return { ok: false, error: passwordCheck.error };
  }

  const tokenHash = hashToken(raw);
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: {
      user: { select: { id: true, email: true, status: true } },
    },
  });

  if (!row) {
    return {
      ok: false,
      error: "Invalid or expired reset link. Request a new one from the login page.",
    };
  }

  if (row.expiresAt.getTime() < Date.now()) {
    await prisma.passwordResetToken.delete({ where: { id: row.id } });
    return {
      ok: false,
      error: "This reset link has expired. Request a new one from the login page.",
    };
  }

  if (row.user.status === "suspended") {
    await prisma.passwordResetToken.deleteMany({ where: { userId: row.userId } });
    return {
      ok: false,
      error: "This account cannot reset a password right now. Contact support.",
    };
  }

  const passwordHash = await hashPassword(input.password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.deleteMany({ where: { userId: row.userId } }),
  ]);

  return { ok: true, email: row.user.email };
}
