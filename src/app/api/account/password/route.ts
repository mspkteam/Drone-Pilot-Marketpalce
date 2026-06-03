import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { changeUserPassword } from "@/lib/account/account";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const result = await changeUserPassword(session.user.id, {
      currentPassword: body.currentPassword ?? "",
      newPassword: body.newPassword ?? "",
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
