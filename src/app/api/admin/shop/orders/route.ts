import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { listOrdersForAdmin } from "@/lib/shop/shop";
import type { UniformOrderStatus } from "@/types/shop";
import { UNIFORM_ORDER_STATUSES } from "@/types/shop";

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
      : UNIFORM_ORDER_STATUSES.includes(statusParam as UniformOrderStatus)
        ? (statusParam as UniformOrderStatus)
        : "all";

  const orders = await listOrdersForAdmin(status);
  return NextResponse.json({ orders });
}
