import { NextResponse } from "next/server";
import {
  requireAdminModuleView,
  requireAdminPermission,
} from "@/lib/auth/require-admin-permission";
import { createProduct, listProductsForAdmin } from "@/lib/shop/shop";

export async function GET() {
  const authResult = await requireAdminModuleView("shop");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const products = await listProductsForAdmin();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const authResult = await requireAdminPermission("shop", "create");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body = await request.json();
  const result = await createProduct({
    name: body.name ?? "",
    description: body.description ?? "",
    imageUrls: Array.isArray(body.imageUrls) ? body.imageUrls : undefined,
    imageUrl: body.imageUrl,
    sortOrder: body.sortOrder,
    isActive: body.isActive,
    minTierCode: body.minTierCode ?? null,
    exactTierCode: body.exactTierCode ?? null,
    requiredWingCode: body.requiredWingCode ?? null,
    variants: Array.isArray(body.variants) ? body.variants : undefined,
    variant: body.variant,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ product: result.product }, { status: 201 });
}
