import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { updateOrderByAdmin } from "@/lib/shop/shop";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const body = await request.json();
  const result = await updateOrderByAdmin(id, {
    status: body.status,
    paymentStatus: body.paymentStatus,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ order: result.order });
}
