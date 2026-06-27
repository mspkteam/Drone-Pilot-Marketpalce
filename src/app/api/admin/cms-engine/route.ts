import { NextResponse } from "next/server";
import { getCmsOverview } from "@/lib/cms/cms-store";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";

export async function GET() {
  const authResult = await requireAdminModuleView("cmsArticles");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  return NextResponse.json(await getCmsOverview());
}
