import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";
import {
  validateCertificateImage,
  writeCertificateBackgroundImage,
} from "@/lib/certificates/image-storage";

export async function POST(request: Request) {
  const createAuth = await requireAdminPermission("certificates", "create");
  const editAuth = createAuth.ok
    ? createAuth
    : await requireAdminPermission("certificates", "edit");
  if (!editAuth.ok) {
    return NextResponse.json(
      { error: editAuth.error },
      { status: editAuth.status },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected a multipart form upload." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }

  const nameHint = formData.get("name");
  const buffer = Buffer.from(await file.arrayBuffer());
  const check = validateCertificateImage(buffer, file.type);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  try {
    const url = await writeCertificateBackgroundImage(
      buffer,
      file.type,
      typeof nameHint === "string" ? nameHint : null,
    );
    return NextResponse.json(
      { url, layoutKey: "custom" },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to store the image. Try again." },
      { status: 500 },
    );
  }
}
