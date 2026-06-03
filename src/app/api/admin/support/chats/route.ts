import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import {
  isValidSupportStatus,
  listSupportChatsForAdmin,
} from "@/lib/support/support";

export async function GET(request: Request) {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") ?? "all";
  const filter =
    statusParam === "all" || isValidSupportStatus(statusParam)
      ? statusParam
      : "all";

  const chats = await listSupportChatsForAdmin(
    filter === "all" ? "all" : filter,
  );

  return NextResponse.json({
    chats,
    canReply: authResult.role === "super_admin",
  });
}
