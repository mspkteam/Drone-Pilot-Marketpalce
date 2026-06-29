import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { getPilotProfileByUserId } from "@/lib/pilot/profile";
import {
  createPortfolioItem,
  parsePortfolioJson,
  serializePortfolioJson,
  type PilotPortfolioDraft,
} from "@/lib/pilot/portfolio";
import { prisma } from "@/lib/db";

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
    return NextResponse.json({ items: [] });
  }

  return NextResponse.json({
    items: parsePortfolioJson(profile.portfolioJson),
  });
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
    return NextResponse.json({ error: "Pilot profile required." }, { status: 404 });
  }

  let body: PilotPortfolioDraft;
  try {
    body = (await request.json()) as PilotPortfolioDraft;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  if (body.type !== "VIDEO" && body.type !== "PHOTOSET") {
    return NextResponse.json({ error: "Invalid media type." }, { status: 400 });
  }

  const items = parsePortfolioJson(profile.portfolioJson);
  const item = createPortfolioItem({
    type: body.type,
    title,
    tags: Array.isArray(body.tags) ? body.tags : [],
    thumbnailUrl: body.thumbnailUrl ?? null,
    description: body.description,
  });

  await prisma.pilotProfile.update({
    where: { id: profile.id },
    data: { portfolioJson: serializePortfolioJson([item, ...items]) },
  });

  return NextResponse.json({ item }, { status: 201 });
}
