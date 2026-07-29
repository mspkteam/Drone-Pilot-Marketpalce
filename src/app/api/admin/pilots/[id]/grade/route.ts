import { NextResponse } from "next/server";
import { adminSetPilotGrade } from "@/lib/admin/pilots";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("users", "edit");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  let body: { tierCode?: unknown };
  try {
    body = (await request.json()) as { tierCode?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const tierCode =
    typeof body.tierCode === "string" ? body.tierCode.trim() : "";
  if (!tierCode) {
    return NextResponse.json(
      { error: "tierCode is required (A-1 … A-6)." },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const result = await adminSetPilotGrade(id, tierCode);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    success: true,
    tierCode: result.tierCode,
    pricingCode: result.pricingCode,
    tierName: result.tierName,
    previousTierCode: result.previousTierCode,
    enrolled: result.enrolled,
  });
}
