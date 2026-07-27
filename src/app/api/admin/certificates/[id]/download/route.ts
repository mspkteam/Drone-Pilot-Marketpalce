import { NextResponse } from "next/server";
import {
  getCertificateWithTemplate,
  getCertificatePdfBuffer,
} from "@/lib/certificates/certificate";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAdminModuleView("certificates");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const cert = await getCertificateWithTemplate(id);
  if (!cert) {
    return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
  }

  try {
    const buffer = await getCertificatePdfBuffer(cert);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cert.certificateNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Admin certificate PDF download failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate certificate PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
