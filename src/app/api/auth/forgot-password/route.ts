import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/auth/password-reset";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const result = await requestPasswordReset(body.email ?? "");
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: result.message,
      ...(result.resetUrl ? { resetUrl: result.resetUrl } : {}),
    });
  } catch (err) {
    console.error("[auth] forgot-password failed:", err);
    return NextResponse.json(
      { error: "Could not start password reset." },
      { status: 500 },
    );
  }
}
