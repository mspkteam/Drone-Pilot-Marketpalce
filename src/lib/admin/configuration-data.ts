import { getCmsOverview, listCmsArticles } from "@/lib/cms/cms-store";
import {
  getDefaultPlatformConfig,
  getPersistedPlatformConfig,
  normalizeGradeRates,
  toDefaultCommissionRow,
} from "@/lib/admin/platform-settings";
import type { AdminConfigurationDataDto } from "@/types/admin-configuration";
import { isEmailDeliveryConfigured } from "@/lib/notifications/smtp-config";

function envConfigured(key: string): boolean {
  return Boolean(process.env[key]?.trim());
}

async function buildContentStats(): Promise<AdminConfigurationDataDto["contentStats"]> {
  const overview = await getCmsOverview();
  const articles = await listCmsArticles();
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

export async function getAdminConfigurationData(): Promise<AdminConfigurationDataDto> {
  const persisted = await getPersistedPlatformConfig();
  const defaults = getDefaultPlatformConfig();

  return {
    defaultCommission: toDefaultCommissionRow(persisted.defaultCommissionRate),
    gradeRates: normalizeGradeRates(persisted.gradeRates),
    manageRules: persisted.manageRules,
    pilotOverridePreview: persisted.pilotOverridePreview,
    emailTemplates: [
      {
        id: "welcome-pilot",
        name: "Welcome — new pilots",
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
    security: persisted.security.length > 0 ? persisted.security : defaults.security,
    integrations: [
      {
        id: "stripe",
        name: "STRIPE",
        status: envConfigured("STRIPE_SECRET_KEY") ? "connected" : "not_configured",
        detail: envConfigured("STRIPE_SECRET_KEY")
          ? "Stripe keys present"
          : "Demo payments only — no Stripe keys",
      },
      {
        id: "sendgrid",
        name: "SENDGRID",
        status:
          envConfigured("SENDGRID_API_KEY") || isEmailDeliveryConfigured()
            ? "connected"
            : "not_configured",
        detail:
          envConfigured("SENDGRID_API_KEY") || isEmailDeliveryConfigured()
            ? "Email delivery configured"
            : "Console logging only — no email provider",
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
        id: "aws-s3",
        name: "AWS S3",
        status:
          envConfigured("AWS_ACCESS_KEY_ID") || envConfigured("S3_BUCKET")
            ? "connected"
            : "not_configured",
        detail: "Object storage for uploads",
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
    contentStats: await buildContentStats(),
    persistenceMode: "persisted",
  };
}
