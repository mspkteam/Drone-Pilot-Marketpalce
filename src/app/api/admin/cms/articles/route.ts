import { NextResponse } from "next/server";
import { createCmsArticle, listCmsArticles } from "@/lib/cms/cms-store";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";

export async function GET() {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  return NextResponse.json({
    articles: listCmsArticles(),
    persistenceMode: "preview" as const,
  });
}

export async function POST(request: Request) {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body = await request.json();
  const result = createCmsArticle(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(
    { article: result.article, persistenceMode: "preview" as const },
    { status: 201 },
  );
}
