import { NextResponse } from "next/server";
import { createCmsArticle, listCmsArticles } from "@/lib/cms/cms-store";
import { requireAdminModuleView, requireAdminPermission } from "@/lib/auth/require-admin-permission";

export async function GET() {
  const authResult = await requireAdminModuleView("cmsArticles");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  return NextResponse.json({
    articles: await listCmsArticles(),
    persistenceMode: "persisted" as const,
  });
}

export async function POST(request: Request) {
  const authResult = await requireAdminPermission("cmsArticles", "create");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body = await request.json();
  const result = await createCmsArticle(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(
    { article: result.article, persistenceMode: "persisted" as const },
    { status: 201 },
  );
}
