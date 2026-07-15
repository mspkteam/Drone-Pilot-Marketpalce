import { NextResponse } from "next/server";
import { createManagementUser } from "@/lib/admin/management-users";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";
import { isManagementUserRole } from "@/types/roles";

export async function POST(request: Request) {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      role?: string;
    };

    if (!body.email || !body.password || !body.role) {
      return NextResponse.json(
        { error: "Email, password, and role are required." },
        { status: 400 },
      );
    }

    if (!isManagementUserRole(body.role)) {
      return NextResponse.json(
        { error: "Role must be Admin or Moderator." },
        { status: 400 },
      );
    }

    const result = await createManagementUser({
      email: body.email,
      password: body.password,
      role: body.role,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ user: result.user }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create management user." },
      { status: 500 },
    );
  }
}
