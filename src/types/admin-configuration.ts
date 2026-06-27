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
