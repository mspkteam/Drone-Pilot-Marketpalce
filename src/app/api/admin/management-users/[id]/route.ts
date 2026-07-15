import { NextResponse } from "next/server";
import { deleteManagementUser } from "@/lib/admin/management-users";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "User id is required." }, { status: 400 });
  }

  try {
    const result = await deleteManagementUser(id, authResult.userId);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    const deletedId = result.deletedId;
    return NextResponse.json({ deletedId });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete management user." },
      { status: 500 },
    );
  }
}
