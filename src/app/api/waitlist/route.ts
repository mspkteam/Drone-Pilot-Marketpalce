import { NextResponse } from "next/server";
import { getClientIp, verifyTurnstileToken } from "@/lib/security/turnstile";
import { waitlistCorsHeaders } from "@/lib/waitlist/cors";
import { joinWaitlist, validateWaitlistInput } from "@/lib/waitlist/waitlist";

function withCors(request: Request, response: NextResponse) {
  const cors = waitlistCorsHeaders(request);
  for (const [key, value] of Object.entries(cors)) {
    response.headers.set(key, value);
  }
  return response;
}

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = validateWaitlistInput(body);
    if (!validated.ok) {
      return withCors(
        request,
        NextResponse.json({ error: validated.error }, { status: 400 }),
      );
    }

    const captcha = await verifyTurnstileToken(
      typeof body.captchaToken === "string" ? body.captchaToken : null,
      getClientIp(request),
    );
    if (!captcha.ok) {
      return withCors(
        request,
        NextResponse.json({ error: captcha.error }, { status: 400 }),
      );
    }

    const result = await joinWaitlist({
      email: validated.email,
      name: validated.name,
      roleInterest: validated.roleInterest,
      region: validated.region,
      source: validated.source,
    });

    return withCors(
      request,
      NextResponse.json(
        {
          entry: result.entry,
          alreadySubscribed: result.alreadySubscribed,
          sheetSynced: result.sheetSynced,
        },
        { status: result.alreadySubscribed ? 200 : 201 },
      ),
    );
  } catch {
    return withCors(
      request,
      NextResponse.json({ error: "Invalid request body." }, { status: 400 }),
    );
  }
}
