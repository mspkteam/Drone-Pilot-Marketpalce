import { NextResponse } from "next/server";
import {
  deleteCertificateTemplate,
  updateCertificateTemplate,
} from "@/lib/certificates/certificate";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";

type RouteContext = { params: Promise<{ id: string }> };

async function requireTemplateWriteAuth() {
  const createAuth = await requireAdminPermission("certificates", "create");
  return createAuth.ok
    ? createAuth
    : await requireAdminPermission("certificates", "edit");
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireTemplateWriteAuth();
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
      ...(Object.prototype.hasOwnProperty.call(body, "overlayPositions")
        ? {
            overlayPositions: (body.overlayPositions as
              | import("@/lib/certificates/layouts").OverlayFieldOverride[]
              | null) ?? null,
          }
        : {}),
      autoRule: body.autoRule as string | null | undefined,
      ruleParam: body.ruleParam as string | null | undefined,
      threshold: body.threshold as number | null | undefined,
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

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireTemplateWriteAuth();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  try {
    const { id } = await context.params;
    const result = await deleteCertificateTemplate(id);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status ?? 400 },
      );
    }
    return NextResponse.json({
      ok: true,
      mode: result.mode,
      issuedRemoved: result.issuedRemoved,
    });
  } catch (error) {
    console.error("[certificate-templates DELETE]", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete template.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
