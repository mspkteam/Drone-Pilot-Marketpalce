import { DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";
import { prisma } from "@/lib/db";
import type {
  AdminConfigurationDataDto,
  ConfigCommissionRow,
  ConfigPilotOverridePreview,
  ConfigSecuritySetting,
} from "@/types/admin-configuration";

const SETTINGS_KEY = "admin_configuration";

export type PersistedPlatformConfig = {
  defaultCommissionRate: number;
  gradeRates: ConfigCommissionRow[];
  manageRules: ConfigCommissionRow[];
  pilotOverridePreview: ConfigPilotOverridePreview;
  security: ConfigSecuritySetting[];
};

function defaultGradeRates(): ConfigCommissionRow[] {
  return [
    { id: "grade-a1", label: "A-1", value: "15%" },
    { id: "grade-a2", label: "A-2", value: "10%" },
    { id: "grade-a3", label: "A-3", value: "12%" },
    { id: "grade-a4", label: "A-4+", value: "8%" },
  ];
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
      gradeRates: parsed.gradeRates ?? defaults.gradeRates,
      manageRules: parsed.manageRules ?? defaults.manageRules,
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
    gradeRates: patch.gradeRates ?? current.gradeRates,
    manageRules: patch.manageRules ?? current.manageRules,
  };

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

export function toDefaultCommissionRow(rate: number): AdminConfigurationDataDto["defaultCommission"] {
  return {
    id: "default-commission",
    label: "Default commission",
    description: "Applies when no other rule matches",
    value: `${Math.round(rate * 100)}%`,
  };
}
