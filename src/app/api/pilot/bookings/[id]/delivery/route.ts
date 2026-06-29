import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { getBookingForPilot } from "@/lib/bookings/booking";
import {
  addDeliveryFile,
  addDeliveryLink,
  getDeliveryForBooking,
  updateDeliveryNotes,
} from "@/lib/deliveries/delivery";
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
    return NextResponse.json({ error: "Pilot profile not found." }, { status: 404 });
  }

  const { id: bookingId } = await context.params;
  const booking = await getBookingForPilot(bookingId, profile.id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const delivery = await getDeliveryForBooking(bookingId);
  return NextResponse.json({ delivery });
}

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile) {
    return NextResponse.json({ error: "Pilot profile not found." }, { status: 404 });
  }

  const { id: bookingId } = await context.params;

  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      const label = String(formData.get("label") ?? "").trim();

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "File is required." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await addDeliveryFile(bookingId, profile.id, {
        buffer,
        mimeType: file.type || "application/octet-stream",
        originalFileName: file.name || "deliverable",
        label: label || undefined,
      });

      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }

      return NextResponse.json({ delivery: result.delivery }, { status: 201 });
    }

    const body = await request.json();

    if (typeof body.notes === "string") {
      const result = await updateDeliveryNotes(bookingId, profile.id, body.notes);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json({ delivery: result.delivery });
    }

    const result = await addDeliveryLink(bookingId, profile.id, {
      url: String(body.url ?? ""),
      label: typeof body.label === "string" ? body.label : undefined,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ delivery: result.delivery }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
