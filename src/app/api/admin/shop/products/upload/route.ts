import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";
import {
  validateShopProductImage,
  writeShopProductImage,
} from "@/lib/shop/image-storage";

export async function POST(request: Request) {
  const createAuth = await requireAdminPermission("shop", "create");
  const authResult = createAuth.ok
    ? createAuth
    : await requireAdminPermission("shop", "manageInventory");
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

  const nameHint = formData.get("name");
  const buffer = Buffer.from(await file.arrayBuffer());
  const check = validateShopProductImage(buffer, file.type);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  try {
    const url = await writeShopProductImage(
      buffer,
      file.type,
      typeof nameHint === "string" ? nameHint : null,
    );
    return NextResponse.json({ url }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to store the image. Try again." },
      { status: 500 },
    );
  }
}
