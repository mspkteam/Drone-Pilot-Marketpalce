import { NextResponse } from "next/server";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";
import { createProduct, listProductsForAdmin } from "@/lib/shop/shop";

export async function GET() {
  const authResult = await requireSuperAdminSession();
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
  const authResult = await requireSuperAdminSession();
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
    imageUrl: body.imageUrl,
    sortOrder: body.sortOrder,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ product: result.product }, { status: 201 });
}
