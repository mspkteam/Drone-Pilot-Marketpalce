import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";
import {
  getUserForAdminEdit,
  updateUserByAdmin,
} from "@/lib/admin/user-edit";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("users", "edit");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const user = await getUserForAdminEdit(id);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  return NextResponse.json({ user });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("users", "edit");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;

  const pilotPayload =
    body.pilot && typeof body.pilot === "object"
      ? (body.pilot as {
          displayName?: string;
          licenseNumber?: string;
          licenseCountry?: string | null;
          status?: string;
          isPublic?: boolean;
          bio?: string | null;
          locationCity?: string | null;
          locationRegion?: string | null;
          locationCountry?: string | null;
          serviceRadiusKm?: number | null;
          hourlyRateMin?: number | null;
          hourlyRateMax?: number | null;
        })
      : undefined;

  const clientPayload =
    body.client && typeof body.client === "object"
      ? (body.client as {
          contactName?: string;
          companyName?: string | null;
          phone?: string | null;
          billingAddress?: string | null;
          status?: string;
          preferences?: {
            roleTitle?: string;
            preferredContact?: string;
            typicalProjectArea?: string;
            defaultBudgetRange?: string;
            approvalContact?: string;
            billingEmail?: string;
            projectTypes?: string[];
          };
        })
      : undefined;

  const result = await updateUserByAdmin(id, {
    email: typeof body.email === "string" ? body.email : undefined,
    status: typeof body.status === "string" ? body.status : undefined,
    moderationNote:
      body.moderationNote === null || typeof body.moderationNote === "string"
        ? (body.moderationNote as string | null)
        : undefined,
    pilot: pilotPayload,
    client: clientPayload,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ user: result.user });
}
