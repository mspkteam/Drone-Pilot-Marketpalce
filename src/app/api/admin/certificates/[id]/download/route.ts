import { NextResponse } from "next/server";
import { getCertificateById } from "@/lib/certificates/certificate";
import { readCertificatePdf } from "@/lib/certificates/storage";
import { requireAdminSession } from "@/lib/auth/require-admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const cert = await getCertificateById(id);
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
