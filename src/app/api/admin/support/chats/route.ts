import { NextResponse } from "next/server";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";
import {
  isValidSupportStatus,
  listSupportChatsForAdmin,
} from "@/lib/support/support";
import { isFullAdminRole } from "@/types/roles";

export async function GET(request: Request) {
  const authResult = await requireAdminModuleView("support");
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
    canReply: isFullAdminRole(authResult.role),
  });
}
