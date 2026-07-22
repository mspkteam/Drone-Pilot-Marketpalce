import { NextResponse } from "next/server";
import {
  createCertificateTemplate,
  listCertificateTemplates,
} from "@/lib/certificates/certificate";
import {
  requireAdminModuleView,
  requireAdminPermission,
} from "@/lib/auth/require-admin-permission";

export async function GET() {
  const authResult = await requireAdminModuleView("certificates");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const templates = await listCertificateTemplates();
  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  const authResult = await requireAdminPermission("certificates", "create");
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
    const result = await createCertificateTemplate({
      name: body.name as string,
      description: body.description as string | null | undefined,
      title: body.title as string,
      bodyTemplate: body.bodyTemplate as string,
      backgroundImageUrl: body.backgroundImageUrl as string | null | undefined,
      layoutKey: body.layoutKey as string | null | undefined,
      overlayPositions: (body.overlayPositions as
        | import("@/lib/certificates/layouts").OverlayFieldOverride[]
        | null
        | undefined) ?? null,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ template: result.template }, { status: 201 });
  } catch (error) {
    console.error("[certificate-templates POST]", error);
    const message =
      error instanceof Error ? error.message : "Failed to create template.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
