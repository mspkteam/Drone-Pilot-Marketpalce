import { NextResponse } from "next/server";
import { updatePlanForAdmin } from "@/lib/admin/subscriptions";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";
import type { AdminPlanUpdateInput } from "@/types/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("subscriptions", "edit");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const body = (await request.json()) as AdminPlanUpdateInput;
  const result = await updatePlanForAdmin(id, body);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 400 },
    );
  }

  return NextResponse.json({ plan: result.plan });
}
