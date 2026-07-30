import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import {
  isRegistrationEnabled,
  REGISTRATION_CLOSED_MESSAGE,
} from "@/lib/auth/registration-gate";
import { validateRegisterInput } from "@/lib/auth/validation";
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

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        status: "active",
      },
      select: { id: true, email: true, role: true },
    });

    if (role === "pilot" || role === "client") {
      const { assignMemberNumberToUser } = await import(
        "@/lib/members/assign-member-number"
      );
      await assignMemberNumberToUser(user.id);
    }

    triggerWelcome(user.id, role);

    return NextResponse.json(
      { user: { id: user.id, email: user.email, role: user.role } },
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
