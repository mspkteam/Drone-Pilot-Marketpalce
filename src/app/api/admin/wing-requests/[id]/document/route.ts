import { NextResponse } from "next/server";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";
import { getWingRequestFileForAccess } from "@/lib/wings/aviator-wing-requests";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const authResult = await requireAdminModuleView("verifications");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const fileName = new URL(request.url).searchParams.get("file") ?? "";
  if (!fileName) {
    return NextResponse.json({ error: "File is required." }, { status: 400 });
  }

  const result = await getWingRequestFileForAccess(id, fileName, {
    userId: authResult.userId,
    role: "admin",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": result.mimeType,
      "Content-Disposition": `inline; filename="${result.downloadName}"`,
    },
  });
}
