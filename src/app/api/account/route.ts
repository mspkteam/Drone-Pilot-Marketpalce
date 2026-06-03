import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAccountForUser } from "@/lib/account/account";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const account = await getAccountForUser(session.user.id);
  if (!account) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  return NextResponse.json({ account });
}
