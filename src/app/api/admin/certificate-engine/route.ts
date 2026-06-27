import { NextResponse } from "next/server";
import { getAdminCertificateEngineData } from "@/lib/admin/certificate-engine";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";

export async function GET() {
  const authResult = await requireAdminModuleView("certificates");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const data = await getAdminCertificateEngineData();
  return NextResponse.json(data);
}
