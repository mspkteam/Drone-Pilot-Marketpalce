import { NextResponse } from "next/server";
import { confirmPasswordReset } from "@/lib/auth/password-reset";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      password?: string;
    };
    const result = await confirmPasswordReset({
      token: body.token ?? "",
      password: body.password ?? "",
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      email: result.email,
      message: "Password updated. You can log in with your new password.",
    });
  } catch (err) {
    console.error("[auth] reset-password failed:", err);
    return NextResponse.json(
      { error: "Could not reset password." },
      { status: 500 },
    );
  }
}
