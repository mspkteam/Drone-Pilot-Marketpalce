import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";
import { updateProduct } from "@/lib/shop/shop";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const createAuth = await requireAdminPermission("shop", "create");
  const authResult = createAuth.ok
    ? createAuth
    : await requireAdminPermission("shop", "manageInventory");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const body = await request.json();
  const result = await updateProduct(id, {
    name: body.name,
    description: body.description,
    imageUrl: body.imageUrl,
    imageUrls: Array.isArray(body.imageUrls) ? body.imageUrls : undefined,
    sortOrder: body.sortOrder,
    isActive: body.isActive,
    category: body.category ?? null,
    isDigital: body.isDigital,
    lowStockThreshold:
      typeof body.stockThreshold === "number"
        ? body.stockThreshold
        : typeof body.lowStockThreshold === "number"
          ? body.lowStockThreshold
          : undefined,
    minTierCode: body.minTierCode ?? null,
    exactTierCode: body.exactTierCode ?? null,
    requiredWingCode: body.requiredWingCode ?? null,
    price: body.price,
    stockQuantity: body.stockQuantity,
    sku: body.sku,
    variants: Array.isArray(body.variants) ? body.variants : undefined,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 400 },
    );
  }

  return NextResponse.json({ product: result.product });
}
