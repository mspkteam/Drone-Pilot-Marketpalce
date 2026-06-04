import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupportRequesterDisplayForUser } from "@/lib/support/requester-display";
import type { UserRole } from "@/types/roles";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ name: "", email: "" });
  }

  if (session.user.role === "moderator") {
    return NextResponse.json(
      { error: "Moderators cannot use support chat." },
      { status: 403 },
    );
  }

  const display = await getSupportRequesterDisplayForUser(
    session.user.id,
    session.user.role as UserRole,
  );

  return NextResponse.json({
    name: display.name,
    email: display.email,
  });
}
