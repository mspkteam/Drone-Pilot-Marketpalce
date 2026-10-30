import { NextResponse } from "next/server";
import { deleteMemberUser } from "@/lib/admin/delete-member-user";
import {
  getUserForAdminEdit,
  updateUserByAdmin,
  type AdminUserUpdateInput,
} from "@/lib/admin/user-edit";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";
import { prisma } from "@/lib/db";
import { isManagementUserRole } from "@/types/roles";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/users/[id]
 * Load a member for the admin edit form.
 */
export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("users", "view");
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

  const user = await getUserForAdminEdit(id);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ user });
}

/**
 * PATCH /api/admin/users/[id]
 * Update account / pilot / client fields from admin member edit.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("users", "edit");
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

  let body: AdminUserUpdateInput;
  try {
    body = (await request.json()) as AdminUserUpdateInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await updateUserByAdmin(id, body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ user: result.user });
}

/**
 * DELETE /api/admin/users/[id]
 * Hard-delete pilot/client (users:edit) or Admin/Moderator (Super Admin only).
 */
export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "User id is required." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, email: true },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (isManagementUserRole(target.role)) {
    const authResult = await requireAdminPermission("users", "edit");
    if (!authResult.ok) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }
    if (authResult.role !== "super_admin") {
      return NextResponse.json(
        {
          error:
            "Only Super Admin can delete Admin or Moderator accounts.",
        },
        { status: 403 },
      );
    }

    const result = await deleteMemberUser(id, authResult.userId);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json({
      deletedId: result.deletedId,
      email: result.email,
      role: result.role,
    });
  }

  if (target.role !== "pilot" && target.role !== "client") {
    return NextResponse.json(
      { error: "This account type cannot be deleted here." },
      { status: 400 },
    );
  }

  const authResult = await requireAdminPermission("users", "edit");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const result = await deleteMemberUser(id, authResult.userId);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({
    deletedId: result.deletedId,
    email: result.email,
    role: result.role,
  });
}
