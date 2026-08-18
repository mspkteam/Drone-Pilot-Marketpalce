import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import { attachWingRequestFile } from "@/lib/wings/aviator-wing-requests";
import { isWingRequestFileSlot } from "@/lib/wings/request-wings";

export async function POST(request: Request) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile || !isOnboardingComplete(profile)) {
    return NextResponse.json(
      { error: "Complete pilot onboarding first." },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const slotRaw = String(formData.get("slot") ?? "");
  const file = formData.get("file");

  if (!isWingRequestFileSlot(slotRaw)) {
    return NextResponse.json({ error: "Invalid document slot." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await attachWingRequestFile(profile.id, slotRaw, {
    buffer,
    mimeType: file.type || "application/octet-stream",
    originalFileName: file.name || slotRaw,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ request: result.request });
}
