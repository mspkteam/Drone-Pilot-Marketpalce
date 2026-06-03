import { NextResponse } from "next/server";
import {
  createCertificateTemplate,
  listCertificateTemplates,
} from "@/lib/certificates/certificate";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function GET() {
  const authResult = await requireAdminSession();
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
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body = await request.json();
  const result = await createCertificateTemplate({
    name: body.name,
    description: body.description,
    title: body.title,
    bodyTemplate: body.bodyTemplate,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ template: result.template }, { status: 201 });
}
