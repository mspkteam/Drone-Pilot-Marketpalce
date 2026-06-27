import { NextResponse } from "next/server";
import { updateCertificateTemplate } from "@/lib/certificates/certificate";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("certificates", "edit");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body = await request.json();
  const { id } = await context.params;
  const result = await updateCertificateTemplate(id, {
    name: body.name,
    description: body.description,
    title: body.title,
    bodyTemplate: body.bodyTemplate,
    isActive: body.isActive,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 400 },
    );
  }

  return NextResponse.json({ template: result.template });
}
