import { NextResponse } from "next/server";
import { listDisputesForAdmin } from "@/lib/disputes/dispute";
import { requireAdminSession } from "@/lib/auth/require-admin";
import type { DisputeStatus } from "@/types/dispute";
import { DISPUTE_STATUSES } from "@/types/dispute";

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
  const status =
    statusParam === "all"
      ? "all"
      : DISPUTE_STATUSES.includes(statusParam as DisputeStatus)
        ? (statusParam as DisputeStatus)
        : "all";

  const disputes = await listDisputesForAdmin(status);
  return NextResponse.json({ disputes });
}
