import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { closeSupportChatForInactivity } from "@/lib/support/support";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await auth();
  const guestToken =
    request.headers.get("x-support-guest-token") ??
    new URL(request.url).searchParams.get("guestToken");

  const result = await closeSupportChatForInactivity(
    id,
    session?.user?.id ?? null,
    guestToken,
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ chat: result.chat });
}
