export type ConfigCommissionRow = {
  id: string;
  label: string;
  description?: string;
  value: string;
};

export type ConfigPilotOverridePreview = {
  pilotName: string;
  rank: string;
  defaultCommission: string;
  manualOverrideEnabled: boolean;
  customCommissionRate: string;
  reason: string;
  effectiveDate: string;
};

/** A pilot returned by the Custom Pilot Rates search box. */
export type PilotRateSearchResult = {
  pilotProfileId: string;
  displayName: string;
  email: string;
  rank: string;
  hasOverride: boolean;
};

/** Full override detail for the selected pilot, used to populate the form. */
export type PilotRateDetail = {
  pilotProfileId: string;
  displayName: string;
  email: string;
  rank: string;
  /** Platform default commission as a percent number, e.g. 15. */
  defaultCommissionPercent: number;
  manualOverrideEnabled: boolean;
  /** Custom rate as a percent number, e.g. 7.5. Null when no override set. */
  customCommissionPercent: number | null;
  reason: string;
  effectiveDate: string;
  updatedAt: string | null;
};

export type ConfigEmailTemplate = {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  body: string;
  variables: string[];
  integrated: boolean;
};

export type ConfigSecuritySetting = {
  id: string;
  label: string;
  enabled: boolean;
  integrated: boolean;
};

export type IntegrationStatus = "connected" | "configured" | "missing" | "not_configured";

export type ConfigIntegration = {
  id: string;
  name: string;
  status: IntegrationStatus;
  detail: string;
};

export type ConfigContentStats = {
  publishedPages: number;
  drafts: number;
  scheduled: number;
  avgReadTimeLabel: string;
  usingCmsPreview: boolean;
};

export type AdminConfigurationDataDto = {
  defaultCommission: ConfigCommissionRow;
  gradeRates: ConfigCommissionRow[];
  manageRules: ConfigCommissionRow[];
  pilotOverridePreview: ConfigPilotOverridePreview;
  emailTemplates: ConfigEmailTemplate[];
  security: ConfigSecuritySetting[];
  integrations: ConfigIntegration[];
  contentStats: ConfigContentStats;
  persistenceMode: "preview" | "persisted";
};
