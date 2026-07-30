import {
  CANONICAL_CERTIFICATE_TEMPLATES,
  OBSOLETE_CERTIFICATE_SLUGS,
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
import { backfillMissingMemberNumbers } from "@/lib/members/assign-member-number";
import type {
  AdminCertificateEngineDataDto,
  AdminCertificateTemplateCardDto,
} from "@/types/admin-certificates";

/** Upsert six fillable RAS templates; deactivate obsolete example rows. */
export async function ensureCanonicalCertificateTemplates(): Promise<void> {
  for (const slug of OBSOLETE_CERTIFICATE_SLUGS) {
    await prisma.certificateTemplate.updateMany({
      where: { slug },
      data: { isActive: false },
    });
  }

  for (const canon of CANONICAL_CERTIFICATE_TEMPLATES) {
    await prisma.certificateTemplate.upsert({
      where: { slug: canon.slug },
      update: {
        name: canon.name,
        title: canon.title,
        description: canon.description,
        bodyTemplate: canon.bodyTemplate,
        autoRule: canon.autoRule,
        threshold: canon.threshold ?? null,
        isActive: canon.isActive,
        // Preserve admin artwork + placement. Overwriting these on every page
        // load wiped uploaded certificates and saved overlays after reload.
      },
      create: {
        name: canon.name,
        slug: canon.slug,
        description: canon.description,
        title: canon.title,
        bodyTemplate: canon.bodyTemplate,
        backgroundImageUrl: canon.backgroundImageUrl,
        layoutKey: canon.layoutKey,
        autoRule: canon.autoRule,
        threshold: canon.threshold ?? null,
        isActive: canon.isActive,
      },
    });
  }
}

export async function getAdminCertificateEngineData(): Promise<AdminCertificateEngineDataDto> {
  await ensureCanonicalCertificateTemplates();
  try {
    await backfillMissingMemberNumbers();
  } catch {
    /* non-fatal — column may not exist until migrate */
  }

  const [dbTemplates, certificates, pilots] = await Promise.all([
    listCertificateTemplates(),
    listCertificatesForAdmin(),
    listPilotsForCertificateAssign(),
  ]);

  const realBySlug = new Map<string, AdminCertificateTemplateCardDto>(
    dbTemplates.map((t) => [t.slug, enrichCertificateTemplate(t)]),
  );

  const templates: AdminCertificateTemplateCardDto[] = [];
  let usingMockTemplates = false;
  for (const canon of CANONICAL_CERTIFICATE_TEMPLATES) {
    const real = realBySlug.get(canon.slug);
    if (real) {
      templates.push(real);
      realBySlug.delete(canon.slug);
    } else {
      const sample = MOCK_CERTIFICATE_TEMPLATES.find((m) => m.slug === canon.slug);
      if (sample) {
        templates.push(sample);
        usingMockTemplates = true;
      }
    }
  }
  for (const remaining of realBySlug.values()) {
    if (!remaining.isActive) continue;
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
