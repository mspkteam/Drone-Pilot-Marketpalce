import { NextResponse } from "next/server";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";
import { updateVariant } from "@/lib/shop/shop";

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
  const body = await request.json();
  const result = await updateVariant(id, body);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 400 },
    );
  }

  return NextResponse.json({ variant: result.variant });
}
