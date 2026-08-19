import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { getPilotProfileByUserId } from "@/lib/pilot/profile";
import {
  parsePortfolioJson,
  serializePortfolioJson,
  updatePortfolioItem,
  type PilotPortfolioDraft,
} from "@/lib/pilot/portfolio";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
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

  const { id } = await context.params;
  const items = parsePortfolioJson(profile.portfolioJson);
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) {
    return NextResponse.json({ error: "Portfolio item not found." }, { status: 404 });
  }

  const next = [...items];
  next[index] = updatePortfolioItem(items[index]!, {
    type: body.type,
    title,
    tags: Array.isArray(body.tags) ? body.tags : [],
    thumbnailUrl: body.thumbnailUrl ?? null,
    description: body.description,
  });

  await prisma.pilotProfile.update({
    where: { id: profile.id },
    data: { portfolioJson: serializePortfolioJson(next) },
  });

  return NextResponse.json({ item: next[index] });
}

export async function DELETE(_request: Request, context: RouteContext) {
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

  const { id } = await context.params;
  const items = parsePortfolioJson(profile.portfolioJson);
  const next = items.filter((item) => item.id !== id);

  if (next.length === items.length) {
    return NextResponse.json({ error: "Portfolio item not found." }, { status: 404 });
  }

  await prisma.pilotProfile.update({
    where: { id: profile.id },
    data: { portfolioJson: serializePortfolioJson(next) },
  });

  return NextResponse.json({ ok: true });
}
