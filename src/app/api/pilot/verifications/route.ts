import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { getPilotProfileByUserId } from "@/lib/pilot/profile";
import {
  listVerificationsForPilot,
  parseVerificationMultipart,
  submitVerificationWithFile,
  submitVerificationWithUrl,
  validateVerificationUrlInput,
} from "@/lib/verification/verification";
import { VERIFICATION_TYPES, type VerificationType } from "@/types/verification";

export async function GET() {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile) {
    return NextResponse.json({ verifications: [] });
  }

  const verifications = await listVerificationsForPilot(profile.id);
  return NextResponse.json({ verifications });
}

export async function POST(request: Request) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile) {
    return NextResponse.json(
      { error: "Complete pilot onboarding first." },
      { status: 400 },
    );
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const parsed = parseVerificationMultipart(formData);

      if (!parsed.type || !VERIFICATION_TYPES.includes(parsed.type as VerificationType)) {
        return NextResponse.json(
          { error: "Valid verification type is required." },
          { status: 400 },
        );
      }

      const type = parsed.type as VerificationType;

      if (parsed.file) {
        const buffer = Buffer.from(await parsed.file.arrayBuffer());
        const result = await submitVerificationWithFile(profile.id, {
          type,
          notes: parsed.notes,
          buffer,
          mimeType: parsed.file.type || "application/octet-stream",
          originalFileName: parsed.file.name || "document",
        });

        if (!result.ok) {
          return NextResponse.json(
            { error: result.error },
            { status: result.status },
          );
        }

        return NextResponse.json(
          { verification: result.verification },
          { status: 201 },
        );
      }

      if (parsed.documentUrl) {
        const validated = validateVerificationUrlInput({
          type: parsed.type,
          documentUrl: parsed.documentUrl,
          notes: parsed.notes,
        });
        if (!validated.ok) {
          return NextResponse.json({ error: validated.error }, { status: 400 });
        }

        const result = await submitVerificationWithUrl(profile.id, {
          type: validated.type,
          documentUrl: validated.documentUrl,
          notes: validated.notes,
        });

        if (!result.ok) {
          return NextResponse.json(
            { error: result.error },
            { status: result.status },
          );
        }

        return NextResponse.json(
          { verification: result.verification },
          { status: 201 },
        );
      }

      return NextResponse.json(
        { error: "Upload a document file or provide a document link." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validated = validateVerificationUrlInput(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const result = await submitVerificationWithUrl(profile.id, {
      type: validated.type,
      documentUrl: validated.documentUrl,
      notes: validated.notes,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json(
      { verification: result.verification },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
