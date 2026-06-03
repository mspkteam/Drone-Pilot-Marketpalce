import { NextResponse } from "next/server";
import { joinWaitlist, validateWaitlistInput } from "@/lib/waitlist/waitlist";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = validateWaitlistInput(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const result = await joinWaitlist({
      email: validated.email,
      name: validated.name,
      roleInterest: validated.roleInterest,
      region: validated.region,
      source: validated.source,
    });

    return NextResponse.json(
      {
        entry: result.entry,
        alreadySubscribed: result.alreadySubscribed,
      },
      { status: result.alreadySubscribed ? 200 : 201 },
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
