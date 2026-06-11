export type ConfigFeeRow = {
  id: string;
  label: string;
  description: string;
  value: string;
  readOnly: true;
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
  fees: ConfigFeeRow[];
  emailTemplates: ConfigEmailTemplate[];
  security: ConfigSecuritySetting[];
  integrations: ConfigIntegration[];
  contentStats: ConfigContentStats;
  persistenceMode: "preview";
};
