import { NextResponse } from "next/server";
import { updatePlanForAdmin } from "@/lib/admin/subscriptions";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";
import type { AdminPlanUpdateInput } from "@/types/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireSuperAdminSession();
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
