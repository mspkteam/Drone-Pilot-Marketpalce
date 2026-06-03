import { NextResponse } from "next/server";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";
import { parseSupportMessageForm } from "@/lib/support/parse";
import { sendSupportMessageAsAdmin } from "@/lib/support/support";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const contentType = request.headers.get("content-type") ?? "";
  let message = "";
  let attachment: Awaited<
    ReturnType<typeof parseSupportMessageForm>
  >["attachment"] = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const parsed = await parseSupportMessageForm(formData);
    message = parsed.message;
    attachment = parsed.attachment;
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
    attachment,
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ message: result.message }, { status: 201 });
}
