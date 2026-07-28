import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";
import { parseSupportMessageForm } from "@/lib/support/parse";
import { sendSupportMessageAsAdmin } from "@/lib/support/support";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("support", "reply");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const contentType = request.headers.get("content-type") ?? "";
  let message = "";
  let attachments: Awaited<
    ReturnType<typeof parseSupportMessageForm>
  >["attachments"] = [];

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const parsed = await parseSupportMessageForm(formData);
    if (parsed.attachmentError) {
      return NextResponse.json(
        { error: parsed.attachmentError },
        { status: 400 },
      );
    }
    message = parsed.message;
    attachments = parsed.attachments;
  } else {
    const body = await request.json();
    message = String(body.message ?? "");
  }

  const result = await sendSupportMessageAsAdmin(
    id,
    authResult.userId,
    authResult.session.user.name?.trim() ||
      authResult.session.user.email?.split("@")[0] ||
      "Support",
    message,
    attachments,
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ message: result.message }, { status: 201 });
}
