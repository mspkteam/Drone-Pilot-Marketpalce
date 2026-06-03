import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { listConversationsForAdmin } from "@/lib/messaging/messaging";

export async function GET() {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const conversations = await listConversationsForAdmin();
  return NextResponse.json({ conversations });
}
