import { NextResponse } from "next/server";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";
import { getVerificationDocumentForAccess } from "@/lib/verification/verification";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAdminModuleView("certificates");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const result = await getVerificationDocumentForAccess(
    id,
    authResult.userId,
    authResult.role,
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": result.mimeType,
      "Content-Disposition": `inline; filename="${result.downloadName}"`,
    },
  });
}
