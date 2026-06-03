import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { listActiveProductsForShop } from "@/lib/shop/shop";

export async function GET() {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const products = await listActiveProductsForShop();
  return NextResponse.json({ products });
}
