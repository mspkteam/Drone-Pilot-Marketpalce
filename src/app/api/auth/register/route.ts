import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { validateRegisterInput } from "@/lib/auth/validation";
import { triggerWelcome } from "@/lib/notifications/triggers";

export async function POST(request: Request) {
  try {
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

    triggerWelcome(user.id, role);

    return NextResponse.json(
      { user: { id: user.id, email: user.email, role: user.role } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
