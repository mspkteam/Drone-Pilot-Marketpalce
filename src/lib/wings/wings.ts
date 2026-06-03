import type { PilotWing, WingDefinition } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { notifyAsync, sendNotification } from "@/lib/notifications/notify";
import type {
  AdminPilotWingDto,
  PilotWingDto,
  PublicPilotWingDto,
  WingAutoRule,
  WingCategory,
  WingDefinitionDto,
  WingSource,
} from "@/types/wing";
import {
  WING_AUTO_RULES,
  WING_CATEGORIES,
} from "@/types/wing";

const definitionInclude = {
  _count: { select: { pilotWings: true } },
} as const;

function slugifyCode(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toDefinitionDto(
  row: WingDefinition & { _count?: { pilotWings: number } },
): WingDefinitionDto {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    category: row.category as WingCategory,
    iconLabel: row.iconLabel,
    autoRule: row.autoRule as WingAutoRule | null,
    ruleParam: row.ruleParam,
    threshold: row.threshold,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    awardedCount: row._count?.pilotWings ?? 0,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toPilotWingDto(
  row: PilotWing & { wingDefinition: WingDefinition },
): PilotWingDto {
  const w = row.wingDefinition;
  return {
    id: row.id,
    pilotProfileId: row.pilotProfileId,
    wingDefinitionId: row.wingDefinitionId,
    code: w.code,
    title: w.title,
    description: w.description,
    category: w.category as WingCategory,
    iconLabel: w.iconLabel,
    source: row.source as WingSource,
    earnedAt: row.earnedAt.toISOString(),
  };
}

export const DEFAULT_WING_DEFINITIONS: Array<{
  code: string;
  title: string;
  description: string;
  category: WingCategory;
  iconLabel: string;
  autoRule: WingAutoRule;
  ruleParam?: string;
  threshold?: number;
  sortOrder: number;
}> = [
  {
    code: "platform-pilot",
    title: "Platform Pilot",
    description: "Approved to operate on the Drone Pilot Marketplace.",
    category: "trust",
    iconLabel: "✓",
    autoRule: "profile_approved",
    sortOrder: 10,
  },
  {
    code: "first-flight",
    title: "First Flight",
    description: "Completed your first marketplace booking.",
    category: "milestone",
    iconLabel: "1",
    autoRule: "first_completed_booking",
    sortOrder: 20,
  },
  {
    code: "reliable-pro",
    title: "Reliable Pro",
    description: "Completed five successful bookings.",
    category: "milestone",
    iconLabel: "5",
    autoRule: "completed_bookings_count",
    threshold: 5,
    sortOrder: 30,
  },
  {
    code: "veteran-pilot",
    title: "Veteran Pilot",
    description: "Completed ten successful bookings.",
    category: "milestone",
    iconLabel: "10",
    autoRule: "completed_bookings_count",
    threshold: 10,
    sortOrder: 40,
  },
  {
    code: "five-star-debut",
    title: "Five-Star Debut",
    description: "Received your first 5-star client review.",
    category: "community",
    iconLabel: "★",
    autoRule: "five_star_reviews_count",
    threshold: 1,
    sortOrder: 50,
  },
  {
    code: "verified-license",
    title: "Verified License",
    description: "License verification approved by the platform.",
    category: "trust",
    iconLabel: "L",
    autoRule: "approved_verification",
    ruleParam: "license",
    sortOrder: 60,
  },
  {
    code: "certified-pilot",
    title: "Certified Pilot",
    description: "Issued an official platform certificate.",
    category: "trust",
    iconLabel: "C",
    autoRule: "has_certificate",
    sortOrder: 70,
  },
  {
    code: "community-champion",
    title: "Community Champion",
    description: "Recognized by admins for outstanding community contribution.",
    category: "community",
    iconLabel: "♛",
    autoRule: "manual_only",
    sortOrder: 80,
  },
];

export async function ensureDefaultWingDefinitions(): Promise<void> {
  for (const def of DEFAULT_WING_DEFINITIONS) {
    await prisma.wingDefinition.upsert({
      where: { code: def.code },
      update: {
        title: def.title,
        description: def.description,
        category: def.category,
        iconLabel: def.iconLabel,
        autoRule: def.autoRule,
        ruleParam: def.ruleParam ?? null,
        threshold: def.threshold ?? null,
        sortOrder: def.sortOrder,
        isActive: true,
      },
      create: {
        code: def.code,
        title: def.title,
        description: def.description,
        category: def.category,
        iconLabel: def.iconLabel,
        autoRule: def.autoRule,
        ruleParam: def.ruleParam ?? null,
        threshold: def.threshold ?? null,
        sortOrder: def.sortOrder,
        isActive: true,
      },
    });
  }
}

export async function listWingDefinitionsForAdmin(): Promise<WingDefinitionDto[]> {
  const rows = await prisma.wingDefinition.findMany({
    include: definitionInclude,
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return rows.map(toDefinitionDto);
}

export async function createWingDefinition(input: {
  code?: string;
  title: string;
  description: string;
  category: string;
  iconLabel?: string | null;
  autoRule?: string | null;
  ruleParam?: string | null;
  threshold?: number | null;
  sortOrder?: number;
}): Promise<
  | { ok: true; definition: WingDefinitionDto }
  | { ok: false; error: string }
> {
  const title = input.title.trim();
  const description = input.description.trim();
  if (!title || description.length < 10) {
    return {
      ok: false,
      error: "Title and description (min 10 chars) are required.",
    };
  }

  const category = input.category as WingCategory;
  if (!WING_CATEGORIES.includes(category)) {
    return { ok: false, error: "Invalid category." };
  }

  const autoRule = input.autoRule
    ? (input.autoRule as WingAutoRule)
    : ("manual_only" as WingAutoRule);
  if (!WING_AUTO_RULES.includes(autoRule)) {
    return { ok: false, error: "Invalid auto-assign rule." };
  }

  const code = (input.code?.trim() || slugifyCode(title)).slice(0, 64);
  if (code.length < 2) {
    return { ok: false, error: "Code is required." };
  }

  const existing = await prisma.wingDefinition.findUnique({ where: { code } });
  if (existing) {
    return { ok: false, error: "A wing with this code already exists." };
  }

  const row = await prisma.wingDefinition.create({
    data: {
      code,
      title,
      description,
      category,
      iconLabel: input.iconLabel?.trim() || null,
      autoRule,
      ruleParam: input.ruleParam?.trim() || null,
      threshold: input.threshold ?? null,
      sortOrder: input.sortOrder ?? 100,
      isActive: true,
    },
    include: definitionInclude,
  });

  return { ok: true, definition: toDefinitionDto(row) };
}

export async function updateWingDefinition(
  id: string,
  input: Partial<{
    title: string;
    description: string;
    category: string;
    iconLabel: string | null;
    autoRule: string | null;
    ruleParam: string | null;
    threshold: number | null;
    sortOrder: number;
    isActive: boolean;
  }>,
): Promise<
  | { ok: true; definition: WingDefinitionDto }
  | { ok: false; error: string; status?: 404 }
> {
  const existing = await prisma.wingDefinition.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, error: "Wing definition not found.", status: 404 };
  }

  if (input.category && !WING_CATEGORIES.includes(input.category as WingCategory)) {
    return { ok: false, error: "Invalid category." };
  }

  if (
    input.autoRule &&
    !WING_AUTO_RULES.includes(input.autoRule as WingAutoRule)
  ) {
    return { ok: false, error: "Invalid auto-assign rule." };
  }

  const row = await prisma.wingDefinition.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description.trim() }
        : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.iconLabel !== undefined
        ? { iconLabel: input.iconLabel?.trim() || null }
        : {}),
      ...(input.autoRule !== undefined ? { autoRule: input.autoRule } : {}),
      ...(input.ruleParam !== undefined
        ? { ruleParam: input.ruleParam?.trim() || null }
        : {}),
      ...(input.threshold !== undefined ? { threshold: input.threshold } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
    include: definitionInclude,
  });

  return { ok: true, definition: toDefinitionDto(row) };
}

async function pilotMeetsAutoRule(
  pilotProfileId: string,
  def: WingDefinition,
): Promise<boolean> {
  const rule = def.autoRule as WingAutoRule | null;
  if (!rule || rule === "manual_only") return false;

  switch (rule) {
    case "profile_approved": {
      const profile = await prisma.pilotProfile.findUnique({
        where: { id: pilotProfileId },
        select: { status: true },
      });
      return profile?.status === "approved";
    }
    case "first_completed_booking": {
      const count = await prisma.booking.count({
        where: { pilotProfileId, status: "completed" },
      });
      return count >= 1;
    }
    case "completed_bookings_count": {
      const threshold = def.threshold ?? 1;
      const count = await prisma.booking.count({
        where: { pilotProfileId, status: "completed" },
      });
      return count >= threshold;
    }
    case "five_star_reviews_count": {
      const threshold = def.threshold ?? 1;
      const count = await prisma.review.count({
        where: {
          targetPilotProfileId: pilotProfileId,
          status: "published",
          rating: 5,
        },
      });
      return count >= threshold;
    }
    case "approved_verification": {
      const type = def.ruleParam ?? "license";
      const row = await prisma.verification.findFirst({
        where: {
          pilotProfileId,
          type,
          status: "approved",
        },
      });
      return Boolean(row);
    }
    case "has_certificate": {
      const count = await prisma.pilotCertificate.count({
        where: { pilotProfileId },
      });
      return count >= 1;
    }
    default:
      return false;
  }
}

export async function grantWingToPilot(
  pilotProfileId: string,
  wingDefinitionId: string,
  options: {
    source: WingSource;
    assignedByUserId?: string | null;
    metadata?: Record<string, unknown> | null;
  },
): Promise<
  | { ok: true; wing: PilotWingDto; created: boolean }
  | { ok: false; error: string; status: 400 | 404 }
> {
  const [pilot, definition] = await Promise.all([
    prisma.pilotProfile.findUnique({
      where: { id: pilotProfileId },
      select: { id: true, userId: true, displayName: true },
    }),
    prisma.wingDefinition.findUnique({ where: { id: wingDefinitionId } }),
  ]);

  if (!pilot) {
    return { ok: false, error: "Pilot not found.", status: 404 };
  }
  if (!definition || !definition.isActive) {
    return { ok: false, error: "Wing definition not found.", status: 404 };
  }

  const existing = await prisma.pilotWing.findUnique({
    where: {
      pilotProfileId_wingDefinitionId: {
        pilotProfileId,
        wingDefinitionId,
      },
    },
    include: { wingDefinition: true },
  });

  if (existing) {
    return {
      ok: true,
      wing: toPilotWingDto(existing),
      created: false,
    };
  }

  const row = await prisma.pilotWing.create({
    data: {
      pilotProfileId,
      wingDefinitionId,
      source: options.source,
      assignedByUserId: options.assignedByUserId ?? null,
      metadata: options.metadata
        ? JSON.stringify(options.metadata)
        : null,
    },
    include: { wingDefinition: true },
  });

  notifyAsync(async () => {
    await sendNotification({
      userId: pilot.userId,
      type: "wing_earned",
      title: "Digital Wing earned",
      body: `You earned "${definition.title}" — ${definition.description}`,
      payload: {
        wingDefinitionId: definition.id,
        pilotWingId: row.id,
      },
    });
  });

  return { ok: true, wing: toPilotWingDto(row), created: true };
}

export async function evaluateAndAssignWings(
  pilotProfileId: string,
): Promise<PilotWingDto[]> {
  const definitions = await prisma.wingDefinition.findMany({
    where: {
      isActive: true,
      autoRule: { not: "manual_only" },
    },
  });

  const awarded: PilotWingDto[] = [];

  for (const def of definitions) {
    const meets = await pilotMeetsAutoRule(pilotProfileId, def);
    if (!meets) continue;

    const result = await grantWingToPilot(pilotProfileId, def.id, {
      source: "auto",
      metadata: { rule: def.autoRule },
    });

    if (result.ok && result.created) {
      awarded.push(result.wing);
    }
  }

  return awarded;
}

export async function listPilotWings(
  pilotProfileId: string,
): Promise<PilotWingDto[]> {
  const rows = await prisma.pilotWing.findMany({
    where: { pilotProfileId },
    include: { wingDefinition: true },
    orderBy: { earnedAt: "desc" },
  });
  return rows.map(toPilotWingDto);
}

export async function listPublicPilotWings(
  pilotProfileId: string,
): Promise<PublicPilotWingDto[]> {
  const rows = await prisma.pilotWing.findMany({
    where: {
      pilotProfileId,
      wingDefinition: { isActive: true },
    },
    include: { wingDefinition: true },
    orderBy: { earnedAt: "desc" },
  });

  const sorted = [...rows].sort(
    (a, b) => a.wingDefinition.sortOrder - b.wingDefinition.sortOrder,
  );

  return sorted.map((r) => ({
    code: r.wingDefinition.code,
    title: r.wingDefinition.title,
    description: r.wingDefinition.description,
    category: r.wingDefinition.category as WingCategory,
    iconLabel: r.wingDefinition.iconLabel,
    earnedAt: r.earnedAt.toISOString(),
  }));
}

export async function listRecentPilotWingsForAdmin(
  limit = 25,
): Promise<AdminPilotWingDto[]> {
  const rows = await prisma.pilotWing.findMany({
    include: {
      wingDefinition: true,
      pilotProfile: {
        include: { user: { select: { email: true } } },
      },
    },
    orderBy: { earnedAt: "desc" },
    take: limit,
  });

  return rows.map((r) => ({
    ...toPilotWingDto(r),
    pilot: {
      id: r.pilotProfile.id,
      displayName: r.pilotProfile.displayName,
      email: r.pilotProfile.user.email,
    },
  }));
}

export async function listPilotsForWingAssign() {
  const pilots = await prisma.pilotProfile.findMany({
    where: { status: "approved" },
    include: { user: { select: { email: true } } },
    orderBy: { displayName: "asc" },
  });
  return pilots.map((p) => ({
    id: p.id,
    displayName: p.displayName,
    email: p.user.email,
  }));
}
