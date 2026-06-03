import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { listOrdersForUser, placeUniformOrder } from "@/lib/shop/shop";

export async function GET() {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const orders = await listOrdersForUser(authResult.userId);
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body = await request.json();
  const result = await placeUniformOrder(
    authResult.userId,
    body.items ?? [],
    {
      shippingName: body.shippingName ?? "",
      shippingLine1: body.shippingLine1 ?? "",
      shippingLine2: body.shippingLine2,
      shippingCity: body.shippingCity ?? "",
      shippingRegion: body.shippingRegion,
      shippingPostal: body.shippingPostal ?? "",
      shippingCountry: body.shippingCountry,
      shippingPhone: body.shippingPhone,
      notes: body.notes,
    },
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ order: result.order }, { status: 201 });
}
