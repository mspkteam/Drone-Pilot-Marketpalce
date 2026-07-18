import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";
import {
  validateCmsMedia,
  writeCmsMedia,
  type CmsMediaKind,
} from "@/lib/cms/media-storage";
import type { PermissionModuleKey } from "@/types/moderator-permissions";

type AuthOk = Awaited<ReturnType<typeof requireAdminPermission>>;

/** Media upload is part of creating/editing content — allow create OR edit. */
async function requireCmsUpload(moduleKey: PermissionModuleKey): Promise<AuthOk> {
  const created = await requireAdminPermission(moduleKey, "create");
  if (created.ok) return created;
  return requireAdminPermission(moduleKey, "edit");
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected a multipart form upload." },
      { status: 400 },
    );
  }

  const moduleKey: PermissionModuleKey =
    formData.get("module") === "cmsResources" ? "cmsResources" : "cmsArticles";

  const authResult = await requireCmsUpload(moduleKey);
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const kind: CmsMediaKind = formData.get("kind") === "file" ? "file" : "image";

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const nameHint = formData.get("name");
  const buffer = Buffer.from(await file.arrayBuffer());
  const check = validateCmsMedia(kind, buffer, file.type);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  try {
    const url = await writeCmsMedia(
      kind,
      buffer,
      file.type,
      typeof nameHint === "string" ? nameHint : null,
    );
    return NextResponse.json({ url }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to store the file. Try again." },
      { status: 500 },
    );
  }
}
