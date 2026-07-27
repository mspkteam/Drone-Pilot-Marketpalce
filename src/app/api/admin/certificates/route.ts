import { NextResponse } from "next/server";
import {
  issueCertificateToPilot,
  listCertificatesForAdmin,
  listPilotsForCertificateAssign,
} from "@/lib/certificates/certificate";
import {
  requireAdminModuleView,
  requireAdminPermission,
} from "@/lib/auth/require-admin-permission";

export async function GET() {
  const authResult = await requireAdminModuleView("certificates");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const [certificates, pilots] = await Promise.all([
    listCertificatesForAdmin(),
    listPilotsForCertificateAssign(),
  ]);

  return NextResponse.json({ certificates, pilots });
}

export async function POST(request: Request) {
  const authResult = await requireAdminPermission("certificates", "issue");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body = await request.json();
  if (!body.pilotProfileId || !body.templateId) {
    return NextResponse.json(
      { error: "pilotProfileId and templateId are required." },
      { status: 400 },
    );
  }

  const result = await issueCertificateToPilot(
    authResult.userId,
    body.pilotProfileId,
    body.templateId,
    {
      notes: typeof body.notes === "string" ? body.notes : null,
      awardGrade: typeof body.awardGrade === "string" ? body.awardGrade : null,
      memberNumber:
        typeof body.memberNumber === "string" ? body.memberNumber : null,
      issuedAt: typeof body.issuedAt === "string" ? body.issuedAt : null,
    },
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ certificate: result.certificate }, { status: 201 });
}
