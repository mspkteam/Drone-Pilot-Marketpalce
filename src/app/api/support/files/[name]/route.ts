import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { readSupportFile } from "@/lib/support/storage";
import { isAdminRole } from "@/types/roles";

type RouteContext = { params: Promise<{ name: string }> };

function normalizeFileName(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function GET(request: Request, context: RouteContext) {
  const { name: rawName } = await context.params;
  const name = normalizeFileName(rawName);
  const session = await auth();
  const guestToken =
    request.headers.get("x-support-guest-token") ??
    new URL(request.url).searchParams.get("guestToken");

  const message = await prisma.supportChatMessage.findFirst({
    where: {
      OR: [{ attachmentUrl: name }, { attachmentUrl: rawName }],
    },
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
    const buffer = await readSupportFile(message.attachmentUrl);
    const mime = message.attachmentMimeType ?? "application/octet-stream";
    const downloadName = message.attachmentFileName ?? message.attachmentUrl;
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `inline; filename="${downloadName.replace(/"/g, "")}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}
