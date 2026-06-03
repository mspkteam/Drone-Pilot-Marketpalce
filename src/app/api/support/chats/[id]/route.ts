import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupportChatThreadForRequester } from "@/lib/support/support";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await auth();
  const guestToken =
    request.headers.get("x-support-guest-token") ??
    new URL(request.url).searchParams.get("guestToken");

  const thread = await getSupportChatThreadForRequester(
    id,
    session?.user?.id ?? null,
    guestToken,
  );

  if (!thread) {
    return NextResponse.json({ error: "Support chat not found." }, { status: 404 });
  }

  return NextResponse.json({ chat: thread });
}
