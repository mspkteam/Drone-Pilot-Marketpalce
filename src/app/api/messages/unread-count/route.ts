import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTotalUnreadCount } from "@/lib/messaging/messaging";
import { isAdminRole, type UserRole } from "@/types/roles";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const role = session.user.role as UserRole;
  if (isAdminRole(role)) {
    return NextResponse.json({ unreadCount: 0 });
  }

  const unreadCount = await getTotalUnreadCount(session.user.id);
  return NextResponse.json({ unreadCount });
}
