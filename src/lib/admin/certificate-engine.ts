import {
  enrichCertificateTemplate,
  MOCK_CERTIFICATE_TEMPLATES,
} from "@/lib/admin/certificate-display";
import { getCertificateStatsForAdmin } from "@/lib/admin/certificate-stats";
import {
  listCertificatesForAdmin,
  listCertificateTemplates,
  listPilotsForCertificateAssign,
} from "@/lib/certificates/certificate";
import type { AdminCertificateEngineDataDto } from "@/types/admin-certificates";

export async function getAdminCertificateEngineData(): Promise<AdminCertificateEngineDataDto> {
  const [dbTemplates, certificates, pilots] = await Promise.all([
    listCertificateTemplates(),
    listCertificatesForAdmin(),
    listPilotsForCertificateAssign(),
  ]);

  const usingMockTemplates = dbTemplates.length === 0;
  const templates = usingMockTemplates
    ? MOCK_CERTIFICATE_TEMPLATES
    : dbTemplates.map(enrichCertificateTemplate);

  const stats = await getCertificateStatsForAdmin(templates.length);

  return {
    templates,
    stats,
    certificates,
    pilots,
    usingMockTemplates,
  };
}
