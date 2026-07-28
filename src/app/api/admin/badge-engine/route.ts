import { NextResponse } from "next/server";
import { getAdminBadgeEngineData } from "@/lib/admin/badge-engine";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";

export async function GET() {
  const authResult = await requireAdminModuleView("badges");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  try {
    const data = await getAdminBadgeEngineData();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[badge-engine]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to load badges.",
      },
      { status: 500 },
    );
  }
}
