import { NextResponse } from "next/server";
import {
  submitContactMessage,
  validateContactMessageInput,
} from "@/lib/contact/contact";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = validateContactMessageInput(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    await submitContactMessage(validated.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not send message." }, { status: 500 });
  }
}
