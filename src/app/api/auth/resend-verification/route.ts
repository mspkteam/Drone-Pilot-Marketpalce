import { NextResponse } from "next/server";
import { resendEmailVerification } from "@/lib/auth/email-verification";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const result = await resendEmailVerification(email);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: "If an unverified account exists for that email, a new link was sent.",
    });
  } catch (err) {
    console.error("[auth] resend-verification failed:", err);
    return NextResponse.json(
      { error: "Could not resend verification email." },
      { status: 500 },
    );
  }
}
