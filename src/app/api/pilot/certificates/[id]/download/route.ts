import { NextResponse } from "next/server";
import {
  getCertificateForPilot,
  getCertificateWithTemplate,
  getCertificatePdfBuffer,
} from "@/lib/certificates/certificate";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { getPilotProfileByUserId } from "@/lib/pilot/profile";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const { id } = await context.params;
  const cert = await getCertificateForPilot(id, profile.id);
  if (!cert) {
    return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
  }

  const full = await getCertificateWithTemplate(cert.id);
  if (!full) {
    return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
  }

  try {
    const buffer = await getCertificatePdfBuffer(full);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cert.certificateNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Pilot certificate PDF download failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate certificate PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
