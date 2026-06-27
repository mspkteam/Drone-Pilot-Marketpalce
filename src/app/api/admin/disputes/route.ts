import { NextResponse } from "next/server";
import { listDisputesForAdmin } from "@/lib/disputes/dispute";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";
import type { DisputeStatus } from "@/types/dispute";
import { DISPUTE_STATUSES } from "@/types/dispute";

export async function GET(request: Request) {
  const authResult = await requireAdminModuleView("disputes");
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
