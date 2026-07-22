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
import { prisma } from "@/lib/db";
import type {
  AdminCertificateEngineDataDto,
  AdminCertificateTemplateCardDto,
} from "@/types/admin-certificates";

/** Upsert the ten client-provided RAS certificate templates (idempotent). */
export async function ensureCanonicalCertificateTemplates(): Promise<void> {
  for (const canon of CANONICAL_CERTIFICATE_TEMPLATES) {
    await prisma.certificateTemplate.upsert({
      where: { slug: canon.slug },
      update: {
        name: canon.name,
        title: canon.title,
        description: canon.description,
        bodyTemplate: canon.bodyTemplate,
        backgroundImageUrl: canon.backgroundImageUrl,
        layoutKey: canon.layoutKey,
        isActive: canon.isActive,
      },
      create: {
        name: canon.name,
        slug: canon.slug,
        description: canon.description,
        title: canon.title,
        bodyTemplate: canon.bodyTemplate,
        backgroundImageUrl: canon.backgroundImageUrl,
        layoutKey: canon.layoutKey,
        isActive: canon.isActive,
      },
    });
  }
}

export async function getAdminCertificateEngineData(): Promise<AdminCertificateEngineDataDto> {
  await ensureCanonicalCertificateTemplates();

  const [dbTemplates, certificates, pilots] = await Promise.all([
    listCertificateTemplates(),
    listCertificatesForAdmin(),
    listPilotsForCertificateAssign(),
  ]);

  const realBySlug = new Map<string, AdminCertificateTemplateCardDto>(
    dbTemplates.map((t) => [t.slug, enrichCertificateTemplate(t)]),
  );

  // Present canonical Remote Air Service templates first (client PNG order).
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
  // Append any additional real templates (custom uploads) that are still active.
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
