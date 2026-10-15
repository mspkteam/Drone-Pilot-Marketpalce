import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import {
  isRegistrationEnabled,
  REGISTRATION_CLOSED_MESSAGE,
} from "@/lib/auth/registration-gate";
import { validateRegisterInput } from "@/lib/auth/validation";
import { createAndSendEmailVerification } from "@/lib/auth/email-verification";
import {
  applyInviteCodeOnRegister,
  ensureUserInviteCode,
} from "@/lib/invites/invite-codes";
import {
  isDeliverableEmailAddress,
  isEmailDeliveryConfigured,
} from "@/lib/notifications/email";
import { triggerWelcome } from "@/lib/notifications/triggers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isRegistrationEnabled()) {
      return NextResponse.json(
        { error: REGISTRATION_CLOSED_MESSAGE },
        { status: 403 },
      );
    }

    const body = await request.json();
    const result = validateRegisterInput({
      email: body.email,
      password: body.password,
      role: body.role,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { email, password, role } = result.data;
    const inviteCode =
      typeof body.inviteCode === "string" ? body.inviteCode : null;

    // Real inboxes need SMTP in production — fail before creating the account.
    if (
      isDeliverableEmailAddress(email) &&
      process.env.NODE_ENV === "production" &&
      !isEmailDeliveryConfigured()
    ) {
      console.error(
        "[auth] register blocked: SMTP not configured for deliverable email",
      );
      return NextResponse.json(
        {
          error:
            "Email confirmation is temporarily unavailable. Please try again shortly or contact support.",
        },
        { status: 503 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    if (inviteCode?.trim()) {
      const inviter = await prisma.user.findFirst({
        where: { inviteCode: inviteCode.trim().toUpperCase() },
        select: { id: true },
      });
      if (!inviter) {
        return NextResponse.json(
          { error: "Invalid invite code." },
          { status: 400 },
        );
      }
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        status: "active",
        emailVerifiedAt: null,
      },
      select: { id: true, email: true, role: true },
    });

    if (role === "pilot" || role === "client") {
      const { assignMemberNumberToUser } = await import(
        "@/lib/members/assign-member-number"
      );
      await assignMemberNumberToUser(user.id);
      await ensureUserInviteCode(user.id);
    }

    const inviteResult = await applyInviteCodeOnRegister(user.id, inviteCode);
    if (!inviteResult.ok) {
      // Account exists; surface invite error without deleting (rare race).
      return NextResponse.json({ error: inviteResult.error }, { status: 400 });
    }

    const verification = await createAndSendEmailVerification(
      user.id,
      user.email,
    );

    if (verification.autoVerified) {
      triggerWelcome(user.id, role);
      return NextResponse.json(
        {
          user: { id: user.id, email: user.email, role: user.role },
          requiresEmailVerification: false,
          autoVerified: true,
          message:
            "Account created. You can log in and continue your profile.",
        },
        { status: 201 },
      );
    }

    if (!verification.sent) {
      return NextResponse.json(
        {
          user: { id: user.id, email: user.email, role: user.role },
          requiresEmailVerification: true,
          emailSent: false,
          message:
            "Account created, but we could not send the confirmation email. Use Resend below, check spam, or try again in a minute.",
        },
        { status: 201 },
      );
    }

    return NextResponse.json(
      {
        user: { id: user.id, email: user.email, role: user.role },
        requiresEmailVerification: true,
        emailSent: true,
        message:
          "Account created. Check your email (and spam folder) for a confirmation link before logging in.",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[auth] register failed:", err);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
