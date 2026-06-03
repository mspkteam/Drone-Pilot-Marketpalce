import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { readSupportFile } from "@/lib/support/storage";
import { isAdminRole } from "@/types/roles";

type RouteContext = { params: Promise<{ name: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { name } = await context.params;
  const session = await auth();
  const guestToken =
    request.headers.get("x-support-guest-token") ??
    new URL(request.url).searchParams.get("guestToken");

  const message = await prisma.supportChatMessage.findFirst({
    where: { attachmentUrl: name },
    include: { supportChat: true },
  });

  if (!message?.attachmentUrl || !message.supportChat) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const chat = message.supportChat;
  const allowed =
    (session?.user?.id && chat.requesterUserId === session.user.id) ||
    (guestToken && chat.guestToken === guestToken) ||
    (session?.user?.role && isAdminRole(session.user.role));

  if (!allowed) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  try {
    const buffer = await readSupportFile(name);
    const mime = message.attachmentMimeType ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `inline; filename="${message.attachmentFileName ?? name}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}
