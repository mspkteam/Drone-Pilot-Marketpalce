import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";
import { validateWingImage, writeWingImage } from "@/lib/wings/image-storage";

export async function POST(request: Request) {
  const authResult = await requireAdminPermission("badges", "edit");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
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

  const codeHint = formData.get("code");
  const buffer = Buffer.from(await file.arrayBuffer());
  const check = validateWingImage(buffer, file.type);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  try {
    const url = await writeWingImage(
      buffer,
      file.type,
      typeof codeHint === "string" ? codeHint : null,
    );
    return NextResponse.json({ url }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to store the image. Try again." },
      { status: 500 },
    );
  }
}
