import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteMemberUser } from "@/lib/admin/delete-member-user";
import {
  emailsMatchForTestDelete,
  isTestInstantDeleteEnabled,
  isValidTestInstantDeleteParam,
  normalizeTestDeleteEmail,
} from "@/lib/account/test-instant-delete";

/**
 * Testing only: permanently delete the signed-in pilot/client account.
 * Requires exact email match via deleteUser=... so the wrong account cannot be wiped.
 */
export async function POST(request: Request) {
  if (!isTestInstantDeleteEnabled()) {
    return NextResponse.json(
      { error: "Test instant delete is disabled." },
      { status: 403 },
    );
  }

  const session = await auth();
  const userId = session?.user?.id;
  const sessionEmail = session?.user?.email;
  if (!userId || !sessionEmail) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  let confirm: string | null = null;
  let deleteUser: string | null = null;
  try {
    const body = (await request.json()) as {
      confirm?: string;
      deleteUser?: string;
    };
    confirm = typeof body.confirm === "string" ? body.confirm : null;
    deleteUser =
      typeof body.deleteUser === "string" ? body.deleteUser : null;
  } catch {
    confirm = null;
    deleteUser = null;
  }

  const { searchParams } = new URL(request.url);
  confirm = confirm ?? searchParams.get("instantDelete");
  deleteUser = deleteUser ?? searchParams.get("deleteUser");

  if (!isValidTestInstantDeleteParam(confirm)) {
    return NextResponse.json(
      { error: "Invalid or missing instantDelete confirm value." },
      { status: 400 },
    );
  }

  const targetEmail = normalizeTestDeleteEmail(deleteUser);
  if (!targetEmail) {
    return NextResponse.json(
      {
        error:
          "Missing deleteUser email. Use ?instantDelete=1&deleteUser=exact@email.com",
      },
      { status: 400 },
    );
  }

  if (!emailsMatchForTestDelete(sessionEmail, targetEmail)) {
    return NextResponse.json(
      {
        error: `Email mismatch. Signed in as ${sessionEmail}, but deleteUser=${targetEmail}.`,
      },
      { status: 403 },
    );
  }

  const result = await deleteMemberUser(userId, userId, { allowSelf: true });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({
    ok: true,
    deletedEmail: result.email,
    message: `Account permanently deleted: ${result.email}`,
  });
}
