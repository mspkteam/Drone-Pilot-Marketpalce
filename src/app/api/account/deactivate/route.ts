import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deactivateUserAccount } from "@/lib/account/deactivation";

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    await deactivateUserAccount(userId);
    return NextResponse.json({
      ok: true,
      message:
        "Account deactivated. Sign in again within 30 days to restore your grade and profile.",
    });
  } catch {
    return NextResponse.json({ error: "Could not deactivate account." }, { status: 500 });
  }
}
