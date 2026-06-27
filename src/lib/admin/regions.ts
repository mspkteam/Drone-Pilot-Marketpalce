import { prisma } from "@/lib/db";

export type OperatingRegionDto = {
  id: string;
  code: string;
  name: string;
  timezone: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_REGIONS = [
  { code: "north-america", name: "North America", timezone: "America/Chicago", sortOrder: 1 },
  { code: "western-europe", name: "Western Europe", timezone: "Europe/London", sortOrder: 2 },
  { code: "middle-east", name: "Middle East", timezone: "Asia/Dubai", sortOrder: 3 },
  { code: "asia-pacific", name: "Asia Pacific", timezone: "Asia/Singapore", sortOrder: 4 },
  { code: "latin-america", name: "Latin America", timezone: "America/Sao_Paulo", sortOrder: 5 },
] as const;

function mapRegion(record: {
  id: string;
  code: string;
  name: string;
  timezone: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): OperatingRegionDto {
  return {
    id: record.id,
    code: record.code,
    name: record.name,
    timezone: record.timezone,
    isActive: record.isActive,
    sortOrder: record.sortOrder,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function ensureRegionsSeeded(): Promise<void> {
  const count = await prisma.operatingRegion.count();
  if (count > 0) return;

  for (const region of DEFAULT_REGIONS) {
    await prisma.operatingRegion.create({ data: region });
  }
}

export async function listOperatingRegions(): Promise<OperatingRegionDto[]> {
  await ensureRegionsSeeded();
  const records = await prisma.operatingRegion.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return records.map(mapRegion);
}

export async function listActiveOperatingRegions(): Promise<OperatingRegionDto[]> {
  await ensureRegionsSeeded();
  const records = await prisma.operatingRegion.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return records.map(mapRegion);
}

export async function createOperatingRegion(input: {
  code: string;
  name: string;
  timezone?: string;
  isActive?: boolean;
  sortOrder?: number;
}): Promise<
  { ok: true; region: OperatingRegionDto } | { ok: false; error: string }
> {
  const code = input.code.trim().toLowerCase().replace(/\s+/g, "-");
  if (!code) return { ok: false, error: "Region code is required." };
  if (!input.name.trim()) return { ok: false, error: "Region name is required." };

  const existing = await prisma.operatingRegion.findUnique({ where: { code } });
  if (existing) return { ok: false, error: "Region code already exists." };

  const record = await prisma.operatingRegion.create({
    data: {
      code,
      name: input.name.trim(),
      timezone: input.timezone ?? "UTC",
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
  });

  return { ok: true, region: mapRegion(record) };
}

export async function updateOperatingRegion(
  id: string,
  input: Partial<{
    code: string;
    name: string;
    timezone: string;
    isActive: boolean;
    sortOrder: number;
  }>,
): Promise<
  | { ok: true; region: OperatingRegionDto }
  | { ok: false; error: string; status?: 404 }
> {
  const existing = await prisma.operatingRegion.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, error: "Region not found.", status: 404 };
  }

  const nextCode = input.code
    ? input.code.trim().toLowerCase().replace(/\s+/g, "-")
    : existing.code;
  if (nextCode !== existing.code) {
    const conflict = await prisma.operatingRegion.findUnique({
      where: { code: nextCode },
    });
    if (conflict) return { ok: false, error: "Region code already exists." };
  }

  const record = await prisma.operatingRegion.update({
    where: { id },
    data: {
      code: nextCode,
      name: input.name?.trim(),
      timezone: input.timezone,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
    },
  });

  return { ok: true, region: mapRegion(record) };
}

export async function deleteOperatingRegion(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string; status?: 404 }> {
  const existing = await prisma.operatingRegion.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, error: "Region not found.", status: 404 };
  }
  await prisma.operatingRegion.delete({ where: { id } });
  return { ok: true };
}
