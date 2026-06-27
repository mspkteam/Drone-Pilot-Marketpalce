import { NextResponse } from "next/server";
import { createCmsResource, listCmsResources } from "@/lib/cms/cms-store";
import { requireAdminModuleView, requireAdminPermission } from "@/lib/auth/require-admin-permission";

export async function GET() {
  const authResult = await requireAdminModuleView("cmsResources");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  return NextResponse.json({
    resources: await listCmsResources(),
    persistenceMode: "persisted" as const,
  });
}

export async function POST(request: Request) {
  const authResult = await requireAdminPermission("cmsResources", "create");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body = await request.json();
  const result = await createCmsResource(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(
    { resource: result.resource, persistenceMode: "persisted" as const },
    { status: 201 },
  );
}
