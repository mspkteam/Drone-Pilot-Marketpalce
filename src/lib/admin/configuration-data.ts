import { DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";
import { getCmsOverview, listCmsArticles } from "@/lib/cms/cms-store";
import type { AdminConfigurationDataDto } from "@/types/admin-configuration";

function envConfigured(key: string): boolean {
  return Boolean(process.env[key]?.trim());
}

function buildContentStats(): AdminConfigurationDataDto["contentStats"] {
  const overview = getCmsOverview();
  const articles = listCmsArticles();
  const now = Date.now();
  const scheduled = articles.filter((article) => {
    if (!article.publishedAt) return false;
    return new Date(article.publishedAt).getTime() > now;
  }).length;

  const readTimes = articles
    .map((article) => article.readTimeMinutes)
    .filter((minutes) => minutes > 0);
  const avgMinutes =
    readTimes.length > 0
      ? readTimes.reduce((sum, minutes) => sum + minutes, 0) / readTimes.length
      : 3.2;
  const mins = Math.floor(avgMinutes);
  const secs = Math.round((avgMinutes - mins) * 60);

  return {
    publishedPages: overview.stats.publishedCount,
    drafts: overview.stats.draftCount,
    scheduled,
    avgReadTimeLabel: `${mins}m ${String(secs).padStart(2, "0")}s`,
    usingCmsPreview: overview.persistenceMode === "preview",
  };
}

export function getAdminConfigurationData(): AdminConfigurationDataDto {
  const commissionPct = `${Math.round(DEFAULT_COMMISSION_RATE * 100)}%`;

  return {
    fees: [
      {
        id: "base-commission",
        label: "Base platform commission",
        description: "Fixed marketplace commission on completed jobs",
        value: commissionPct,
        readOnly: true,
      },
      {
        id: "payment-processing",
        label: "Payment processing",
        description: "Stripe pass-through (planned)",
        value: "2.9% + $0.30",
        readOnly: true,
      },
      {
        id: "withdrawal-fee",
        label: "Withdrawal fee",
        description: "Per pilot payout (planned)",
        value: "$1.50",
        readOnly: true,
      },
      {
        id: "currency-conversion",
        label: "Currency conversion",
        description: "Above mid-market rate (planned)",
        value: "1.2%",
        readOnly: true,
      },
    ],
    emailTemplates: [
      {
        id: "welcome-pilot",
        name: "Welcome — new pilot",
        subject: "Welcome to Remote Air Service",
        preheader: "Your pilot account is ready.",
        body: "Your pilot account is ready. Complete your profile to get started.",
        variables: ["{{role}}", "{{displayName}}"],
        integrated: true,
      },
      {
        id: "welcome-client",
        name: "Welcome — new client",
        subject: "Welcome to Remote Air Service",
        preheader: "Your client account is ready.",
        body: "Your client account is ready. Post your first job when you are ready.",
        variables: ["{{role}}", "{{displayName}}"],
        integrated: true,
      },
      {
        id: "mission-approved",
        name: "Mission approved",
        subject: "Job approved",
        preheader: "Your job is open for pilot applications.",
        body: '"{{jobTitle}}" is now open for pilot applications.',
        variables: ["{{jobTitle}}", "{{jobId}}"],
        integrated: true,
      },
      {
        id: "payout-sent",
        name: "Payout sent",
        subject: "Payout record available",
        preheader: "Your payout record is ready.",
        body: "Your payout record is available under Payments after booking completion.",
        variables: ["{{bookingId}}", "{{amount}}"],
        integrated: false,
      },
      {
        id: "dispute-opened",
        name: "Dispute opened",
        subject: "Dispute opened",
        preheader: "A booking dispute requires review.",
        body: "A dispute has been opened on booking {{bookingId}}. Moderators will review the case.",
        variables: ["{{bookingId}}", "{{reason}}"],
        integrated: true,
      },
      {
        id: "certificate-issued",
        name: "Certificate issued",
        subject: "Certificate issued",
        preheader: "A new certificate is available.",
        body: "A certificate has been issued to your pilot account. Download it from Certificates.",
        variables: ["{{certificateId}}", "{{templateName}}"],
        integrated: true,
      },
    ],
    security: [
      {
        id: "admin-2fa",
        label: "Require 2FA for admins",
        enabled: false,
        integrated: false,
      },
      {
        id: "auto-suspend",
        label: "Auto-suspend after 5 failed logins",
        enabled: false,
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
        enabled: false,
        integrated: false,
      },
    ],
    integrations: [
      {
        id: "database",
        name: "NEON DATABASE",
        status: envConfigured("DATABASE_URL") ? "connected" : "not_configured",
        detail: envConfigured("DATABASE_URL")
          ? "PostgreSQL connection configured"
          : "DATABASE_URL missing",
      },
      {
        id: "auth",
        name: "AUTH.JS",
        status: envConfigured("AUTH_SECRET") ? "configured" : "not_configured",
        detail: envConfigured("AUTH_SECRET")
          ? "Session secret configured"
          : "AUTH_SECRET missing",
      },
      {
        id: "smtp",
        name: "EMAIL (SMTP)",
        status: envConfigured("SMTP_URL") ? "connected" : "not_configured",
        detail: envConfigured("SMTP_URL")
          ? "SMTP_URL configured"
          : "Console logging only — SMTP_URL not set",
      },
      {
        id: "stripe",
        name: "STRIPE",
        status: envConfigured("STRIPE_SECRET_KEY") ? "connected" : "not_configured",
        detail: envConfigured("STRIPE_SECRET_KEY")
          ? "Stripe keys present"
          : "Demo payments only — no Stripe keys",
      },
      {
        id: "storage",
        name: "FILE STORAGE",
        status: "configured",
        detail: "Local disk storage for verifications and certificates",
      },
      {
        id: "twilio",
        name: "TWILIO",
        status: envConfigured("TWILIO_ACCOUNT_SID") ? "connected" : "not_configured",
        detail: "SMS not integrated",
      },
      {
        id: "mapbox",
        name: "MAPBOX",
        status: envConfigured("MAPBOX_ACCESS_TOKEN") ? "connected" : "not_configured",
        detail: "Maps not integrated",
      },
      {
        id: "docusign",
        name: "DOCUSIGN",
        status: envConfigured("DOCUSIGN_INTEGRATION_KEY")
          ? "connected"
          : "not_configured",
        detail: "E-sign not integrated",
      },
    ],
    contentStats: buildContentStats(),
    persistenceMode: "preview",
  };
}
