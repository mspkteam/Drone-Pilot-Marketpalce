import { NextResponse } from "next/server";
import { getCertificateForPilot } from "@/lib/certificates/certificate";
import { readCertificatePdf } from "@/lib/certificates/storage";
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

  try {
    const buffer = await readCertificatePdf(cert.pdfFileName);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cert.certificateNumber}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "PDF file not found." }, { status: 404 });
  }
}
