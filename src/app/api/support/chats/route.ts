import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { parseSupportCreateForm } from "@/lib/support/parse";
import {
  createSupportChat,
  listSupportChatsForRequester,
  mapUserRoleToRequesterRole,
} from "@/lib/support/support";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ chats: [] });
  }

  if (session.user.role === "moderator") {
    return NextResponse.json(
      { error: "Moderators cannot use support chat." },
      { status: 403 },
    );
  }

  const chats = await listSupportChatsForRequester(session.user.id);
  return NextResponse.json({ chats });
}

export async function POST(request: Request) {
  const session = await auth();
  const requesterRole = mapUserRoleToRequesterRole(session?.user?.role);

  let requesterName = "";
  let requesterEmail = "";
  let message = "";
  let attachment: Awaited<
    ReturnType<typeof parseSupportCreateForm>
  >["attachment"] = null;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const parsed = await parseSupportCreateForm(formData);
    requesterName = parsed.requesterName;
    requesterEmail = parsed.requesterEmail;
    message = parsed.message;
    attachment = parsed.attachment;
  } else {
    const body = await request.json();
    requesterName = String(body.requesterName ?? "");
    requesterEmail = String(body.requesterEmail ?? "");
    message = String(body.message ?? "");
  }

  if (session?.user) {
    if (session.user.role === "moderator") {
      return NextResponse.json(
        { error: "Moderators cannot start support chats." },
        { status: 403 },
      );
    }
    requesterName = requesterName || session.user.name || "User";
    requesterEmail = requesterEmail || session.user.email || "";
  }

  const role = requesterRole ?? "guest";

  const result = await createSupportChat({
    requesterName,
    requesterEmail,
    message,
    requesterUserId: session?.user?.id ?? null,
    requesterRole: role,
    attachment,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json(
    {
      chat: result.chat,
      guestToken: result.guestToken,
    },
    { status: 201 },
  );
}
