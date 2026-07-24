import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { prisma } from "@/lib/db";
import { listActiveProductsForShop } from "@/lib/shop/shop";

export async function GET() {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await prisma.pilotProfile.findUnique({
    where: { userId: authResult.userId },
    select: { id: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Pilot profile not found." }, { status: 404 });
  }

  const products = await listActiveProductsForShop(profile.id);
  return NextResponse.json({ products });
}
