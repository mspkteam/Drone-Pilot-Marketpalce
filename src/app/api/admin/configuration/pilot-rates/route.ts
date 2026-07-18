import { NextResponse } from "next/server";
import {
  getPilotRateDetail,
  savePilotRateOverride,
  searchPilotsForRates,
} from "@/lib/admin/pilot-rates";
import {
  requireAdminModuleView,
  requireAdminPermission,
} from "@/lib/auth/require-admin-permission";

export async function GET(request: Request) {
  const authResult = await requireAdminModuleView("configuration");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const pilotProfileId = searchParams.get("pilotProfileId");

  if (pilotProfileId) {
    const detail = await getPilotRateDetail(pilotProfileId);
    if (!detail) {
      return NextResponse.json({ error: "Pilot not found." }, { status: 404 });
    }
    return NextResponse.json({ detail });
  }

  const query = searchParams.get("q") ?? "";
  const results = await searchPilotsForRates(query);
  return NextResponse.json({ results });
}

export async function PATCH(request: Request) {
  const authResult = await requireAdminPermission(
    "configuration",
    "manageSettings",
  );
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.pilotProfileId !== "string") {
    return NextResponse.json(
      { error: "pilotProfileId is required." },
      { status: 400 },
    );
  }

  const rawPercent = body.customCommissionPercent;
  const customCommissionPercent =
    rawPercent === null || rawPercent === undefined || rawPercent === ""
      ? null
      : Number(rawPercent);

  const result = await savePilotRateOverride({
    pilotProfileId: body.pilotProfileId,
    manualOverrideEnabled: Boolean(body.manualOverrideEnabled),
    customCommissionPercent,
    reason: typeof body.reason === "string" ? body.reason : "",
    effectiveDate: typeof body.effectiveDate === "string" ? body.effectiveDate : "",
    setByUserId: authResult.userId,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    message: result.detail.manualOverrideEnabled
      ? `Custom commission rate saved for ${result.detail.displayName}.`
      : `Override removed — ${result.detail.displayName} now uses the platform default.`,
    detail: result.detail,
  });
}
