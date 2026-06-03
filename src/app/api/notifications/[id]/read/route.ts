import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { markNotificationRead } from "@/lib/notifications/notify";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await context.params;
  const ok = await markNotificationRead(id, session.user.id);

  if (!ok) {
    return NextResponse.json({ error: "Notification not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
