import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getUnreadCount,
  listNotificationsForUser,
  markAllNotificationsRead,
} from "@/lib/notifications/notify";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unreadOnly") === "1";

  const [notifications, unreadCount] = await Promise.all([
    listNotificationsForUser(session.user.id, {
      unreadOnly,
      limit: 30,
      role: session.user.role,
    }),
    getUnreadCount(session.user.id),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  await markAllNotificationsRead(session.user.id);
  return NextResponse.json({ ok: true });
}
