import { NextResponse } from "next/server";
import { getAdminConfigurationData } from "@/lib/admin/configuration-data";
import { savePersistedPlatformConfig } from "@/lib/admin/platform-settings";
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
  const saved = await savePersistedPlatformConfig({
    defaultCommissionRate:
      typeof body.defaultCommissionRate === "number"
        ? body.defaultCommissionRate
        : undefined,
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
}
