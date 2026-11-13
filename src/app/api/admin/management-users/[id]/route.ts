import { NextResponse } from "next/server";
import {
  deleteManagementUser,
  updateManagementUserRole,
} from "@/lib/admin/management-users";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";
import { isManagementUserRole } from "@/types/roles";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
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

  let body: { role?: string };
  try {
    body = (await request.json()) as { role?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.role || !isManagementUserRole(body.role)) {
    return NextResponse.json(
      { error: "Role must be admin or moderator." },
      { status: 400 },
    );
  }

  try {
    const result = await updateManagementUserRole(
      id,
      authResult.userId,
      body.role,
    );
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json({ user: result.user });
  } catch {
    return NextResponse.json(
      { error: "Failed to update management user role." },
      { status: 500 },
    );
  }
}

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
