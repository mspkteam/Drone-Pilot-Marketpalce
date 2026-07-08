import { NextResponse } from "next/server";

function marketplaceApiOrigin(): string | null {
  const url =
    process.env.WAITLIST_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_WAITLIST_API_URL?.trim();
  return url || null;
}

export async function POST(request: Request) {
  const apiOrigin = marketplaceApiOrigin();
  if (!apiOrigin) {
    return NextResponse.json(
      { error: "Waitlist API is not configured." },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const upstream = await fetch(
      `${apiOrigin.replace(/\/$/, "")}/api/waitlist`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { error: "Could not reach waitlist service." },
      { status: 502 },
    );
  }
}
