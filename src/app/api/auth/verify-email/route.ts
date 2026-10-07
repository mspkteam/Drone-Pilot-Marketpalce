import { NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/auth/email-verification";
import { prisma } from "@/lib/db";
import { triggerWelcome } from "@/lib/notifications/triggers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };
    const token = body.token?.trim();
    if (!token) {
      return NextResponse.json({ error: "Missing verification token." }, { status: 400 });
    }

    const result = await verifyEmailToken(token);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: result.email },
      select: { id: true, role: true },
    });
    if (user) {
      triggerWelcome(user.id, user.role);
    }

    return NextResponse.json({
      ok: true,
      email: result.email,
      message: "Email confirmed. You can log in and continue your profile.",
    });
  } catch (err) {
    console.error("[auth] verify-email failed:", err);
    return NextResponse.json(
      { error: "Could not verify email." },
      { status: 500 },
    );
  }
}
