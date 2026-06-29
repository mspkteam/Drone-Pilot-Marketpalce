import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import { getDeliveryFileForAccess } from "@/lib/deliveries/delivery";
import { getClientProfileByUserId } from "@/lib/client/profile";

type RouteContext = { params: Promise<{ id: string; fileId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireClientSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getClientProfileByUserId(authResult.userId);
  if (!profile) {
    return NextResponse.json({ error: "Client profile not found." }, { status: 404 });
  }

  const { id: bookingId, fileId } = await context.params;
  const result = await getDeliveryFileForAccess(bookingId, fileId, {
    clientProfileId: profile.id,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": result.mimeType,
      "Content-Disposition": `inline; filename="${result.downloadName}"`,
    },
  });
}
