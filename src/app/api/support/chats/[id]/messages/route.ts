import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { parseSupportMessageForm } from "@/lib/support/parse";
import {
  mapUserRoleToRequesterRole,
  sendSupportMessageAsRequester,
} from "@/lib/support/support";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await auth();
  const guestToken = request.headers.get("x-support-guest-token");

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

  const senderRole = mapUserRoleToRequesterRole(session?.user?.role) ?? "guest";
  const senderName =
    session?.user?.name?.trim() ||
    session?.user?.email?.split("@")[0] ||
    "Guest";

  const result = await sendSupportMessageAsRequester(id, {
    userId: session?.user?.id ?? null,
    guestToken,
    senderRole,
    senderName,
    message,
    attachment,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ message: result.message }, { status: 201 });
}
