import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";
import {
  CERT_IMAGE_MAX_BYTES,
  isAllowedCertImageMime,
  validateCertificateImage,
  writeCertificateBackgroundImage,
} from "@/lib/certificates/image-storage";

type UploadPayload = {
  buffer: Buffer;
  mime: string;
  nameHint: string | null;
};

/**
 * Prefer JSON `{ mimeType, dataBase64, name }` — multipart FormData POSTs are
 * intermittently intercepted as Server Actions under Next.js 16 + Turbopack
 * ("Server action not found" / 404). Multipart is still accepted as a fallback.
 */
async function parseUpload(request: Request): Promise<
  | { ok: true; payload: UploadPayload }
  | { ok: false; status: number; error: string }
> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    let body: {
      mimeType?: unknown;
      dataBase64?: unknown;
      name?: unknown;
    };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return { ok: false, status: 400, error: "Invalid JSON body." };
    }

    const mime =
      typeof body.mimeType === "string" ? body.mimeType.trim() : "";
    const dataBase64 =
      typeof body.dataBase64 === "string" ? body.dataBase64.trim() : "";
    if (!mime || !dataBase64) {
      return {
        ok: false,
        status: 400,
        error: "mimeType and dataBase64 are required.",
      };
    }
    if (!isAllowedCertImageMime(mime)) {
      return {
        ok: false,
        status: 400,
        error: "Allowed types: PNG, JPEG, or WebP.",
      };
    }

    const raw = dataBase64.includes(",")
      ? dataBase64.slice(dataBase64.indexOf(",") + 1)
      : dataBase64;
    let buffer: Buffer;
    try {
      buffer = Buffer.from(raw, "base64");
    } catch {
      return { ok: false, status: 400, error: "Invalid base64 image data." };
    }
    if (!buffer.length) {
      return { ok: false, status: 400, error: "File is empty." };
    }
    if (buffer.length > CERT_IMAGE_MAX_BYTES) {
      return {
        ok: false,
        status: 400,
        error: `Image must be ${CERT_IMAGE_MAX_BYTES / (1024 * 1024)} MB or smaller.`,
      };
    }

    return {
      ok: true,
      payload: {
        buffer,
        mime,
        nameHint: typeof body.name === "string" ? body.name : null,
      },
    };
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return {
      ok: false,
      status: 400,
      error: "Expected JSON or multipart form upload.",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof Blob)) {
    return { ok: false, status: 400, error: "No image provided." };
  }

  const mime = file.type || "application/octet-stream";
  const buffer = Buffer.from(await file.arrayBuffer());
  const nameHint = formData.get("name");

  return {
    ok: true,
    payload: {
      buffer,
      mime,
      nameHint: typeof nameHint === "string" ? nameHint : null,
    },
  };
}

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

  const parsed = await parseUpload(request);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error },
      { status: parsed.status },
    );
  }

  const { buffer, mime, nameHint } = parsed.payload;
  const check = validateCertificateImage(buffer, mime);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  try {
    const url = await writeCertificateBackgroundImage(buffer, mime, nameHint);
    return NextResponse.json({ url, layoutKey: "custom" }, { status: 201 });
  } catch (error) {
    console.error("[certificate-templates/upload]", error);
    return NextResponse.json(
      { error: "Failed to store the image. Try again." },
      { status: 500 },
    );
  }
}
