import { NextResponse } from "next/server";
import { updateCertificateTemplate } from "@/lib/certificates/certificate";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const createAuth = await requireAdminPermission("certificates", "create");
  const authResult = createAuth.ok
    ? createAuth
    : await requireAdminPermission("certificates", "edit");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  try {
    const { id } = await context.params;
    const result = await updateCertificateTemplate(id, {
      name: body.name as string | undefined,
      description: body.description as string | null | undefined,
      title: body.title as string | undefined,
      bodyTemplate: body.bodyTemplate as string | undefined,
      isActive: body.isActive as boolean | undefined,
      backgroundImageUrl: body.backgroundImageUrl as string | null | undefined,
      layoutKey: body.layoutKey as string | null | undefined,
      overlayPositions: (body.overlayPositions as
        | import("@/lib/certificates/layouts").OverlayFieldOverride[]
        | null
        | undefined) ?? null,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status ?? 400 },
      );
    }

    return NextResponse.json({ template: result.template });
  } catch (error) {
    console.error("[certificate-templates PATCH]", error);
    const message =
      error instanceof Error ? error.message : "Failed to save template.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
