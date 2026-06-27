import { NextResponse } from "next/server";
import {
  requireAdminModuleView,
  requireAdminPermission,
} from "@/lib/auth/require-admin-permission";
import {
  getSupportChatForAdmin,
  isValidSupportStatus,
  updateSupportChatStatus,
} from "@/lib/support/support";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAdminModuleView("support");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const chat = await getSupportChatForAdmin(id, authResult.role);
  if (!chat) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ chat });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("support", "changeStatus");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const body = await request.json();
  const status = String(body.status ?? "");

  if (!isValidSupportStatus(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const result = await updateSupportChatStatus(id, status);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ chat: result.chat });
}
