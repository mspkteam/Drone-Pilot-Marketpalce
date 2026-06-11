import { NextResponse } from "next/server";
import { getCmsResourceById, updateCmsResource } from "@/lib/cms/cms-store";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const resource = getCmsResourceById(id);
  if (!resource) {
    return NextResponse.json({ error: "Resource not found." }, { status: 404 });
  }

  return NextResponse.json({ resource, persistenceMode: "preview" as const });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const body = await request.json();
  const result = updateCmsResource(id, body);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 400 },
    );
  }

  return NextResponse.json({
    resource: result.resource,
    persistenceMode: "preview" as const,
  });
}
