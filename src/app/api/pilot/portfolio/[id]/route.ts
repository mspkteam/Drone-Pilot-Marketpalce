import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { getPilotProfileByUserId } from "@/lib/pilot/profile";
import { parsePortfolioJson, serializePortfolioJson } from "@/lib/pilot/portfolio";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

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
