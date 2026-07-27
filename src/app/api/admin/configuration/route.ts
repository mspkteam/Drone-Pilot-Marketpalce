import { NextResponse } from "next/server";
import { getAdminConfigurationData } from "@/lib/admin/configuration-data";
import {
  parseCommissionPercent,
  savePersistedPlatformConfig,
  validateCommissionRows,
} from "@/lib/admin/platform-settings";
import {
  requireAdminModuleView,
  requireAdminPermission,
} from "@/lib/auth/require-admin-permission";

export async function GET() {
  const authResult = await requireAdminModuleView("configuration");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  return NextResponse.json(await getAdminConfigurationData());
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

  const body = await request.json();

  let defaultCommissionRate: number | undefined;
  if (typeof body.defaultCommissionRate === "number") {
    defaultCommissionRate = body.defaultCommissionRate;
  } else if (typeof body.defaultCommissionPercent === "string") {
    const parsed = parseCommissionPercent(body.defaultCommissionPercent);
    if (parsed == null) {
      return NextResponse.json(
        { error: "Default commission must be a percent between 0 and 100." },
        { status: 400 },
      );
    }
    defaultCommissionRate = parsed;
  }

  if (Array.isArray(body.gradeRates)) {
    const gradeError = validateCommissionRows(body.gradeRates, "Grade commission");
    if (gradeError) {
      return NextResponse.json({ error: gradeError }, { status: 400 });
    }
  }

  try {
    const saved = await savePersistedPlatformConfig({
      defaultCommissionRate,
      gradeRates: body.gradeRates,
      manageRules: body.manageRules,
      pilotOverridePreview: body.pilotOverridePreview,
      security: body.security,
    });

    return NextResponse.json({
      message: "Configuration saved.",
      defaultCommissionRate: saved.defaultCommissionRate,
      persistenceMode: "persisted" as const,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save configuration.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
