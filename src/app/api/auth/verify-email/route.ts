import { NextResponse } from "next/server";
import {
  appBaseUrl,
  verifyEmailToken,
} from "@/lib/auth/email-verification";
import { prisma } from "@/lib/db";
import { triggerWelcome } from "@/lib/notifications/triggers";

export const runtime = "nodejs";

async function applyVerification(token: string): Promise<
  | { ok: true; email: string; newlyVerified: boolean }
  | { ok: false; error: string }
> {
  const result = await verifyEmailToken(token);
  if (!result.ok) return result;

  if (result.newlyVerified) {
    const user = await prisma.user.findUnique({
      where: { email: result.email },
      select: { id: true, role: true },
    });
    if (user) {
      triggerWelcome(user.id, user.role);
    }
  }

  return result;
}

/** Email clients open this link — confirm server-side, then redirect to UI. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim() ?? "";
  const base = appBaseUrl(request);

  if (!token) {
    return NextResponse.redirect(
      `${base}/verify-email?error=${encodeURIComponent("Missing verification token.")}`,
    );
  }

  try {
    const result = await applyVerification(token);
    if (!result.ok) {
      return NextResponse.redirect(
        `${base}/verify-email?error=${encodeURIComponent(result.error)}`,
      );
    }
    return NextResponse.redirect(`${base}/verify-email?confirmed=1`);
  } catch (err) {
    console.error("[auth] verify-email GET failed:", err);
    return NextResponse.redirect(
      `${base}/verify-email?error=${encodeURIComponent("Could not verify email.")}`,
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };
    const token = body.token?.trim();
    if (!token) {
      return NextResponse.json(
        { error: "Missing verification token." },
        { status: 400 },
      );
    }

    const result = await applyVerification(token);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      email: result.email,
      newlyVerified: result.newlyVerified,
      message: result.newlyVerified
        ? "Email confirmed. You can log in and continue your profile."
        : "Email already confirmed. You can log in.",
    });
  } catch (err) {
    console.error("[auth] verify-email failed:", err);
    return NextResponse.json(
      { error: "Could not verify email." },
      { status: 500 },
    );
  }
}
