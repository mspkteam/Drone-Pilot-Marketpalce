import { NextResponse } from "next/server";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";
import { createVariant } from "@/lib/shop/shop";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id: productId } = await context.params;
  const body = await request.json();
  const result = await createVariant(productId, {
    sku: body.sku ?? "",
    label: body.label ?? "",
    size: body.size,
    color: body.color,
    price: Number(body.price),
    stockQuantity: Number(body.stockQuantity ?? 0),
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 400 },
    );
  }

  return NextResponse.json({ variant: result.variant }, { status: 201 });
}
