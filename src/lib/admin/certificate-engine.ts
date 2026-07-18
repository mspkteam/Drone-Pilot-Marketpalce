import {
  CANONICAL_CERTIFICATE_TEMPLATES,
  enrichCertificateTemplate,
  MOCK_CERTIFICATE_TEMPLATES,
} from "@/lib/admin/certificate-display";
import { getCertificateStatsForAdmin } from "@/lib/admin/certificate-stats";
import {
  listCertificatesForAdmin,
  listCertificateTemplates,
  listPilotsForCertificateAssign,
} from "@/lib/certificates/certificate";
import type {
  AdminCertificateEngineDataDto,
  AdminCertificateTemplateCardDto,
} from "@/types/admin-certificates";

export async function getAdminCertificateEngineData(): Promise<AdminCertificateEngineDataDto> {
  const [dbTemplates, certificates, pilots] = await Promise.all([
    listCertificateTemplates(),
    listCertificatesForAdmin(),
    listPilotsForCertificateAssign(),
  ]);

  const realBySlug = new Map<string, AdminCertificateTemplateCardDto>(
    dbTemplates.map((t) => [t.slug, enrichCertificateTemplate(t)]),
  );

  // Present canonical Remote Air Service templates first (Figma order), using
  // the real DB row when it exists and a preview-only sample otherwise.
  const templates: AdminCertificateTemplateCardDto[] = [];
  let usingMockTemplates = false;
  for (const canon of CANONICAL_CERTIFICATE_TEMPLATES) {
    const real = realBySlug.get(canon.slug);
    if (real) {
      templates.push(real);
      realBySlug.delete(canon.slug);
    } else {
      const sample = MOCK_CERTIFICATE_TEMPLATES.find(
        (m) => m.slug === canon.slug,
      );
      if (sample) {
        templates.push(sample);
        usingMockTemplates = true;
      }
    }
  }
  // Append any additional real templates (e.g. admin-created, platform-verified).
  for (const remaining of realBySlug.values()) {
    templates.push(remaining);
  }

  const stats = await getCertificateStatsForAdmin();

  return {
    templates,
    stats,
    certificates,
    pilots,
    usingMockTemplates,
  };
}
