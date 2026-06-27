import { NextResponse } from "next/server";
import { getCmsResourceById, updateCmsResource } from "@/lib/cms/cms-store";
import { requireAdminModuleView, requireAdminPermission } from "@/lib/auth/require-admin-permission";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAdminModuleView("cmsResources");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const resource = await getCmsResourceById(id);
  if (!resource) {
    return NextResponse.json({ error: "Resource not found." }, { status: 404 });
  }

  return NextResponse.json({ resource, persistenceMode: "persisted" as const });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("cmsResources", "edit");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const body = await request.json();
  const result = await updateCmsResource(id, body);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 400 },
    );
  }

  return NextResponse.json({
    resource: result.resource,
    persistenceMode: "persisted" as const,
  });
}
