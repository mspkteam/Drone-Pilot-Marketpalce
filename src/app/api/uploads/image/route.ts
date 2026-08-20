import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  isUserImageKind,
  validateUserImage,
  writeUserImage,
  type UserImageKind,
} from "@/lib/storage/user-image";
import { isAdminRole, type UserRole } from "@/types/roles";

/**
 * Authenticated image upload → Vercel Blob (or local /public fallback).
 * Accepts multipart `file` + `kind`, or JSON `{ kind, mimeType, dataBase64, name }`.
 */
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role as UserRole | undefined;
  if (!userId || !role) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const staff = isAdminRole(role);
  if (role !== "client" && role !== "pilot" && !staff) {
    return NextResponse.json({ error: "Upload not allowed for this role." }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const kindRaw = String(formData.get("kind") ?? "");
      if (!isUserImageKind(kindRaw)) {
        return NextResponse.json(
          { error: "kind must be avatar, logo, portfolio, or job-reference." },
          { status: 400 },
        );
      }
      const kind = kindRaw;
      if (kind === "avatar" && role !== "pilot" && !staff) {
        return NextResponse.json({ error: "Avatars are for pilot profiles." }, { status: 403 });
      }
      if (kind === "logo" && role !== "client" && !staff) {
        return NextResponse.json({ error: "Logos are for client profiles." }, { status: 403 });
      }

      const file = formData.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "No file provided." }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const mime = file.type || "application/octet-stream";
      const check = validateUserImage(kind, buffer, mime);
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }
      const url = await writeUserImage({
        kind,
        buffer,
        mime,
        userId,
        nameHint: file.name,
      });
      return NextResponse.json({ url, kind, fileName: file.name }, { status: 201 });
    }

    const body = (await request.json()) as {
      kind?: string;
      mimeType?: string;
      dataBase64?: string;
      name?: string;
    };
    if (!body.kind || !isUserImageKind(body.kind)) {
      return NextResponse.json(
        { error: "kind must be avatar, logo, portfolio, or job-reference." },
        { status: 400 },
      );
    }
    const kind: UserImageKind = body.kind;
    if (kind === "avatar" && role !== "pilot" && !staff) {
      return NextResponse.json({ error: "Avatars are for pilot profiles." }, { status: 403 });
    }
    if (kind === "logo" && role !== "client" && !staff) {
      return NextResponse.json({ error: "Logos are for client profiles." }, { status: 403 });
    }
    if (!body.mimeType || !body.dataBase64) {
      return NextResponse.json(
        { error: "mimeType and dataBase64 are required." },
        { status: 400 },
      );
    }
    let buffer: Buffer;
    try {
      buffer = Buffer.from(body.dataBase64, "base64");
    } catch {
      return NextResponse.json({ error: "Invalid base64 image data." }, { status: 400 });
    }
    const check = validateUserImage(kind, buffer, body.mimeType);
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }
    const url = await writeUserImage({
      kind,
      buffer,
      mime: body.mimeType,
      userId,
      nameHint: body.name ?? null,
    });
    return NextResponse.json({ url, kind, fileName: body.name ?? null }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to store the file. Try again." },
      { status: 500 },
    );
  }
}
