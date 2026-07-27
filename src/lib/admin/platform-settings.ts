import { DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";
import { prisma } from "@/lib/db";
import type {
  AdminConfigurationDataDto,
  ConfigCommissionRow,
  ConfigPilotOverridePreview,
  ConfigSecuritySetting,
} from "@/types/admin-configuration";

const SETTINGS_KEY = "admin_configuration";

export const GRADE_COMMISSION_IDS = [
  "grade-a1",
  "grade-a2",
  "grade-a3",
  "grade-a4",
  "grade-a5",
  "grade-a6",
] as const;

export type GradeCommissionId = (typeof GRADE_COMMISSION_IDS)[number];

export type PersistedPlatformConfig = {
  defaultCommissionRate: number;
  gradeRates: ConfigCommissionRow[];
  manageRules: ConfigCommissionRow[];
  pilotOverridePreview: ConfigPilotOverridePreview;
  security: ConfigSecuritySetting[];
};

export function defaultGradeRates(): ConfigCommissionRow[] {
  const defaultPct = `${Math.round(DEFAULT_COMMISSION_RATE * 100)}%`;
  return [
    { id: "grade-a1", label: "A-1", description: "Student", value: defaultPct },
    { id: "grade-a2", label: "A-2", description: "Junior Flight Officer", value: defaultPct },
    { id: "grade-a3", label: "A-3", description: "Flight Officer", value: defaultPct },
    { id: "grade-a4", label: "A-4", description: "Senior Flight Officer", value: defaultPct },
    { id: "grade-a5", label: "A-5", description: "First Officer", value: defaultPct },
    { id: "grade-a6", label: "A-6", description: "Captain", value: defaultPct },
  ];
}

/** Ensure persisted config always exposes all six RAS grades (A-1–A-6). */
export function normalizeGradeRates(
  existing: ConfigCommissionRow[] | undefined,
): ConfigCommissionRow[] {
  const defaults = defaultGradeRates();
  if (!existing?.length) return defaults;

  const byId = new Map(existing.map((row) => [row.id, row]));
  const byLabel = new Map(existing.map((row) => [row.label.replace(/\+$/, ""), row]));

  return defaults.map((def) => {
    const saved = byId.get(def.id) ?? byLabel.get(def.label);
    if (!saved) return def;
    return {
      ...def,
      value: saved.value,
      description: saved.description ?? def.description,
    };
  });
}

export function formatCommissionPercent(rate: number): string {
  const pct = Math.round(rate * 100 * 100) / 100;
  return Number.isInteger(pct) ? `${pct}%` : `${pct}%`;
}

/** Parse admin-entered values like `15`, `15%`, or `7.5%` into a 0–1 fraction. */
export function parseCommissionPercent(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*%?$/);
  if (!match) return null;
  const pct = Number(match[1]);
  if (!Number.isFinite(pct) || pct < 0 || pct > 100) return null;
  return Math.round((pct / 100) * 10000) / 10000;
}

export function resolveGradeCommissionRate(
  gradeRates: ConfigCommissionRow[],
  gradeLabel: string,
): number | null {
  const normalized = gradeLabel.trim().toUpperCase();
  const row =
    gradeRates.find((entry) => entry.label.toUpperCase() === normalized) ??
    gradeRates.find((entry) =>
      normalized.startsWith(entry.label.toUpperCase().replace(/\+$/, "")),
    );
  if (!row) return null;
  return parseCommissionPercent(row.value);
}

export function validateCommissionRows(
  rows: ConfigCommissionRow[],
  label: string,
): string | null {
  for (const row of rows) {
    if (!row.label.trim()) {
      return `${label}: each row needs a label.`;
    }
    if (parseCommissionPercent(row.value) == null) {
      return `${label}: "${row.label}" must be a percent between 0 and 100.`;
    }
  }
  return null;
}

function defaultManageRules(): ConfigCommissionRow[] {
  return [
    {
      id: "payment-processing",
      label: "Payment processing",
      description: "Stripe pass-through",
      value: "2.9% + $0.3",
    },
    {
      id: "withdrawal-fee",
      label: "Withdrawal fee",
      description: "Per pilot payout",
      value: "$1.50",
    },
    {
      id: "currency-conversion",
      label: "Currency conversion",
      description: "Above mid-market rate",
      value: "1.2%",
    },
  ];
}

function defaultPilotOverride(): ConfigPilotOverridePreview {
  const commissionPct = `${Math.round(DEFAULT_COMMISSION_RATE * 100)}%`;
  return {
    pilotName: "James Sterling",
    rank: "A-4",
    defaultCommission: commissionPct,
    manualOverrideEnabled: true,
    customCommissionRate: "7.5%",
    reason: "High performance pilot incentive",
    effectiveDate: "Next completed contract",
  };
}

function defaultSecurity(): ConfigSecuritySetting[] {
  return [
    { id: "admin-2fa", label: "Require 2FA for admins", enabled: true, integrated: false },
    {
      id: "auto-suspend",
      label: "Auto-suspend after 5 failed logins",
      enabled: true,
      integrated: false,
    },
    {
      id: "ip-allowlist",
      label: "IP allowlist for super admins",
      enabled: false,
      integrated: false,
    },
    {
      id: "sso-google",
      label: "Single sign-on (Google Workspace)",
      enabled: true,
      integrated: false,
    },
  ];
}

export function getDefaultPlatformConfig(): PersistedPlatformConfig {
  return {
    defaultCommissionRate: DEFAULT_COMMISSION_RATE,
    gradeRates: defaultGradeRates(),
    manageRules: defaultManageRules(),
    pilotOverridePreview: defaultPilotOverride(),
    security: defaultSecurity(),
  };
}

export async function getPersistedPlatformConfig(): Promise<PersistedPlatformConfig> {
  const record = await prisma.platformSetting.findUnique({
    where: { key: SETTINGS_KEY },
  });
  if (!record) return getDefaultPlatformConfig();

  try {
    const parsed = JSON.parse(record.valueJson) as Partial<PersistedPlatformConfig>;
    const defaults = getDefaultPlatformConfig();
    return {
      defaultCommissionRate:
        parsed.defaultCommissionRate ?? defaults.defaultCommissionRate,
      gradeRates: normalizeGradeRates(parsed.gradeRates),
      manageRules: parsed.manageRules?.length
        ? parsed.manageRules
        : defaults.manageRules,
      pilotOverridePreview:
        parsed.pilotOverridePreview ?? defaults.pilotOverridePreview,
      security: parsed.security ?? defaults.security,
    };
  } catch {
    return getDefaultPlatformConfig();
  }
}

export async function savePersistedPlatformConfig(
  patch: Partial<PersistedPlatformConfig>,
): Promise<PersistedPlatformConfig> {
  const current = await getPersistedPlatformConfig();
  const next: PersistedPlatformConfig = {
    ...current,
    ...patch,
    pilotOverridePreview: {
      ...current.pilotOverridePreview,
      ...patch.pilotOverridePreview,
    },
    security: patch.security ?? current.security,
    gradeRates: normalizeGradeRates(patch.gradeRates ?? current.gradeRates),
    manageRules: patch.manageRules ?? current.manageRules,
  };

  const gradeError = validateCommissionRows(next.gradeRates, "Grade commission");
  if (gradeError) {
    throw new Error(gradeError);
  }

  if (
    next.defaultCommissionRate < 0 ||
    next.defaultCommissionRate > 1 ||
    !Number.isFinite(next.defaultCommissionRate)
  ) {
    throw new Error("Default commission must be between 0% and 100%.");
  }

  await prisma.platformSetting.upsert({
    where: { key: SETTINGS_KEY },
    create: { key: SETTINGS_KEY, valueJson: JSON.stringify(next) },
    update: { valueJson: JSON.stringify(next) },
  });

  return next;
}

export async function getEffectiveCommissionRate(): Promise<number> {
  const config = await getPersistedPlatformConfig();
  return config.defaultCommissionRate;
}

/** Grade-specific platform rate, then default commission, as a fraction. */
export async function getGradeCommissionRateForLabel(
  gradeLabel: string,
): Promise<number> {
  const config = await getPersistedPlatformConfig();
  return (
    resolveGradeCommissionRate(config.gradeRates, gradeLabel) ??
    config.defaultCommissionRate
  );
}

export function toDefaultCommissionRow(rate: number): AdminConfigurationDataDto["defaultCommission"] {
  return {
    id: "default-commission",
    label: "Default commission",
    description: "Applies when no other rule matches",
    value: `${Math.round(rate * 100)}%`,
  };
}
