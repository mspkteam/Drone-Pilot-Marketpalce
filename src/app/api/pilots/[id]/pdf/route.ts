import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  publicPilotProfilePdfFileName,
  renderPublicPilotProfilePdf,
} from "@/lib/pilot/profile-pdf";
import { getPublicPilotById } from "@/lib/pilot/public";
import { isPublicPilotProfileEnabled } from "@/lib/public-access";

type RouteContext = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(_request: Request, context: RouteContext) {
  if (!isPublicPilotProfileEnabled()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { id } = await context.params;
  const session = await auth();
  const pilot = await getPublicPilotById(id, {
    viewerUserId: session?.user?.id,
    viewerRole: session?.user?.role,
  });

  if (!pilot) {
    return NextResponse.json({ error: "Pilot not found." }, { status: 404 });
  }

  try {
    const buffer = await renderPublicPilotProfilePdf(pilot);
    const fileName = publicPilotProfilePdfFileName(pilot.displayName);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Public pilot profile PDF failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate profile PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
