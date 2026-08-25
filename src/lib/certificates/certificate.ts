import type {
  CertificateTemplate,
  PilotCertificate,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { notifyAsync, sendNotification } from "@/lib/notifications/notify";
import {
  CERTIFICATE_AUTO_RULES,
  GRADE_DISPLAY_TITLES,
  PROMOTION_GRADE_CODES,
  isCertificateAutoRule,
  type CertificateAutoRule,
} from "@/lib/certificates/conditions";
import {
  parseOverlayPositionsJson,
  sanitizeOverlayOverrides,
  serializeOverlayPositions,
  type OverlayFieldOverride,
} from "@/lib/certificates/layouts";
import {
  getManualIssueFieldsFromTemplate,
  parseManualIssueDate,
} from "@/lib/certificates/manual-issue";
import { applyTemplate, renderCertificatePdf } from "@/lib/certificates/pdf";
import { writeCertificatePdf, deleteCertificatePdf } from "@/lib/certificates/storage";
import { assignMemberNumberToUser } from "@/lib/members/assign-member-number";
import {
  displayMemberNumber,
  formatMemberNumber,
  looksLikeMemberNumber,
} from "@/lib/members/member-number";
import { evaluateAndAssignWings } from "@/lib/wings/wings";
import type {
  AdminPilotCertificateDto,
  CertificateTemplateDto,
  PilotCertificateDto,
} from "@/types/certificate";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generateCertificateNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `DPM-${year}-`;
  const latest = await prisma.pilotCertificate.findFirst({
    where: { certificateNumber: { startsWith: prefix } },
    orderBy: { certificateNumber: "desc" },
  });

  let seq = 1;
  if (latest) {
    const part = latest.certificateNumber.slice(prefix.length);
    const n = parseInt(part, 10);
    if (!Number.isNaN(n)) seq = n + 1;
  }

  return `${prefix}${String(seq).padStart(6, "0")}`;
}

function toTemplateDto(
  t: CertificateTemplate & { _count?: { certificates: number } },
): CertificateTemplateDto {
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    description: t.description,
    title: t.title,
    bodyTemplate: t.bodyTemplate,
    backgroundImageUrl: t.backgroundImageUrl,
    layoutKey: t.layoutKey,
    overlayPositions: parseOverlayPositionsJson(t.overlayPositionsJson),
    autoRule: (t.autoRule as CertificateAutoRule) || "manual_only",
    ruleParam: t.ruleParam,
    threshold: t.threshold,
    isActive: t.isActive,
    issuedCount: t._count?.certificates ?? 0,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

function toPilotCertDto(
  c: PilotCertificate & { template: { name: string } },
): PilotCertificateDto {
  return {
    id: c.id,
    certificateNumber: c.certificateNumber,
    pilotProfileId: c.pilotProfileId,
    templateId: c.templateId,
    templateName: c.template.name,
    pilotDisplayName: c.pilotDisplayName,
    licenseNumber: c.licenseNumber,
    awardGrade: c.awardGrade,
    issuedAt: c.issuedAt.toISOString(),
    issuedByUserId: c.issuedByUserId,
    notes: c.notes,
    createdAt: c.createdAt.toISOString(),
  };
}

export async function listCertificateTemplates(): Promise<CertificateTemplateDto[]> {
  const rows = await prisma.certificateTemplate.findMany({
    include: { _count: { select: { certificates: true } } },
    orderBy: { name: "asc" },
  });
  return rows.map(toTemplateDto);
}

export async function createCertificateTemplate(input: {
  name: string;
  description?: string | null;
  title: string;
  bodyTemplate: string;
  backgroundImageUrl?: string | null;
  layoutKey?: string | null;
  overlayPositions?: OverlayFieldOverride[] | null;
  autoRule?: string | null;
  ruleParam?: string | null;
  threshold?: number | null;
}): Promise<
  | { ok: true; template: CertificateTemplateDto }
  | { ok: false; error: string }
> {
  const name = input.name.trim();
  const title = input.title.trim();
  const bodyTemplate = input.bodyTemplate.trim();

  if (!name || !title || bodyTemplate.length < 20) {
    return {
      ok: false,
      error: "Name, title, and body template (min 20 chars) are required.",
    };
  }

  const slug = slugify(name);
  const existing = await prisma.certificateTemplate.findUnique({
    where: { slug },
  });
  if (existing) {
    return { ok: false, error: "A template with this name already exists." };
  }

  const backgroundImageUrl = input.backgroundImageUrl?.trim() || null;
  const layoutKey =
    input.layoutKey?.trim() || (backgroundImageUrl ? "custom" : null);

  const autoRule = isCertificateAutoRule(input.autoRule)
    ? input.autoRule
    : "manual_only";

  const row = await prisma.certificateTemplate.create({
    data: {
      name,
      slug,
      description: input.description?.trim() || null,
      title,
      bodyTemplate,
      backgroundImageUrl,
      layoutKey,
      overlayPositionsJson: serializeOverlayPositions(
        sanitizeOverlayOverrides(input.overlayPositions),
      ),
      autoRule,
      ruleParam: input.ruleParam?.trim() || null,
      threshold: input.threshold ?? null,
    },
    include: { _count: { select: { certificates: true } } },
  });

  return { ok: true, template: toTemplateDto(row) };
}

export async function updateCertificateTemplate(
  id: string,
  input: Partial<{
    name: string;
    description: string | null;
    title: string;
    bodyTemplate: string;
    isActive: boolean;
    backgroundImageUrl: string | null;
    layoutKey: string | null;
    overlayPositions: OverlayFieldOverride[] | null;
    autoRule: string | null;
    ruleParam: string | null;
    threshold: number | null;
  }>,
): Promise<
  | { ok: true; template: CertificateTemplateDto }
  | { ok: false; error: string; status?: 404 }
> {
  const existing = await prisma.certificateTemplate.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, error: "Template not found.", status: 404 };
  }

  if (
    input.autoRule !== undefined &&
    input.autoRule !== null &&
    !isCertificateAutoRule(input.autoRule)
  ) {
    return { ok: false, error: "Invalid auto-assign rule." };
  }

  const row = await prisma.certificateTemplate.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.bodyTemplate !== undefined
        ? { bodyTemplate: input.bodyTemplate.trim() }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.backgroundImageUrl !== undefined
        ? { backgroundImageUrl: input.backgroundImageUrl?.trim() || null }
        : {}),
      ...(input.layoutKey !== undefined
        ? { layoutKey: input.layoutKey?.trim() || null }
        : {}),
      ...(input.overlayPositions !== undefined
        ? {
            overlayPositionsJson: serializeOverlayPositions(
              sanitizeOverlayOverrides(input.overlayPositions),
            ),
          }
        : {}),
      ...(input.autoRule !== undefined
        ? { autoRule: input.autoRule ?? "manual_only" }
        : {}),
      ...(input.ruleParam !== undefined
        ? { ruleParam: input.ruleParam?.trim() || null }
        : {}),
      ...(input.threshold !== undefined ? { threshold: input.threshold } : {}),
    },
    include: { _count: { select: { certificates: true } } },
  });

  return { ok: true, template: toTemplateDto(row) };
}

export async function listCertificatesForPilot(
  pilotProfileId: string,
): Promise<PilotCertificateDto[]> {
  const rows = await prisma.pilotCertificate.findMany({
    where: { pilotProfileId },
    include: { template: { select: { name: true } } },
    orderBy: { issuedAt: "desc" },
  });
  return rows.map(toPilotCertDto);
}

export async function listCertificatesForAdmin(): Promise<AdminPilotCertificateDto[]> {
  const rows = await prisma.pilotCertificate.findMany({
    include: {
      template: { select: { name: true } },
      pilotProfile: {
        include: { user: { select: { email: true, memberNumber: true } } },
      },
    },
    orderBy: { issuedAt: "desc" },
  });

  return rows.map((c) => {
    const platformMember = displayMemberNumber(
      c.pilotProfile.user.memberNumber,
    );
    const stored = c.licenseNumber?.trim() || null;
    const memberDisplay = displayMemberNumber(stored) ?? platformMember;

    return {
      ...toPilotCertDto(c),
      // Always surface a real RAS member # in the audit trail (never a name).
      licenseNumber: memberDisplay,
      pilotEmail: c.pilotProfile.user.email,
    };
  });
}

export async function listPilotsForCertificateAssign() {
  const pilots = await prisma.pilotProfile.findMany({
    where: { status: { in: ["approved", "pending_review"] } },
    include: { user: { select: { email: true, memberNumber: true } } },
    orderBy: { displayName: "asc" },
  });
  return pilots.map((p) => ({
    id: p.id,
    displayName: p.displayName,
    email: p.user.email,
    licenseNumber: p.licenseNumber,
    memberNumber: displayMemberNumber(p.user.memberNumber),
  }));
}

async function countPerfectContracts(pilotProfileId: string): Promise<number> {
  const completed = await prisma.booking.findMany({
    where: { pilotProfileId, status: "completed" },
    select: { id: true },
  });
  if (!completed.length) return 0;
  const bookingIds = completed.map((b) => b.id);
  const fiveStar = await prisma.review.groupBy({
    by: ["bookingId"],
    where: {
      bookingId: { in: bookingIds },
      targetPilotProfileId: pilotProfileId,
      status: "published",
      rating: 5,
    },
  });
  return fiveStar.length;
}

async function pilotHasWingCode(
  pilotProfileId: string,
  codeIncludes: string[],
): Promise<boolean> {
  const wings = await prisma.pilotWing.findMany({
    where: { pilotProfileId },
    include: { wingDefinition: { select: { code: true } } },
  });
  return wings.some((w) =>
    codeIncludes.some((needle) =>
      w.wingDefinition.code.toLowerCase().includes(needle.toLowerCase()),
    ),
  );
}

async function getPilotGradeCode(pilotProfileId: string): Promise<string | null> {
  const sub = await prisma.pilotSubscription.findFirst({
    where: {
      pilotProfileId,
      status: { in: ["active", "trialing"] },
    },
    include: { subscriptionPlan: { select: { code: true } } },
    orderBy: { createdAt: "desc" },
  });
  return sub?.subscriptionPlan.code ?? null;
}

async function pilotMeetsCertificateRule(
  pilotProfileId: string,
  template: CertificateTemplate,
): Promise<{ meets: boolean; awardGrade?: string | null }> {
  const rule = (template.autoRule || "manual_only") as CertificateAutoRule;
  if (!CERTIFICATE_AUTO_RULES.includes(rule) || rule === "manual_only") {
    return { meets: false };
  }

  switch (rule) {
    case "grade_promotion_a1_a5": {
      const code = await getPilotGradeCode(pilotProfileId);
      if (!code || !(PROMOTION_GRADE_CODES as readonly string[]).includes(code)) {
        return { meets: false };
      }
      const title = GRADE_DISPLAY_TITLES[code] ?? code;
      const already = await prisma.pilotCertificate.findFirst({
        where: {
          pilotProfileId,
          templateId: template.id,
          awardGrade: title,
        },
        select: { id: true },
      });
      if (already) return { meets: false };
      return { meets: true, awardGrade: title };
    }
    case "grade_captain_a6": {
      const code = await getPilotGradeCode(pilotProfileId);
      if (code !== "A6_CAPTAIN") return { meets: false };
      const already = await prisma.pilotCertificate.count({
        where: { pilotProfileId, templateId: template.id },
      });
      if (already > 0) return { meets: false };
      return { meets: true, awardGrade: "CAPTAIN" };
    }
    case "wing_recreational": {
      const has = await pilotHasWingCode(pilotProfileId, [
        "recreational",
        "remote-aviation-crew",
      ]);
      if (!has) return { meets: false };
      const already = await prisma.pilotCertificate.count({
        where: { pilotProfileId, templateId: template.id },
      });
      return { meets: already === 0 };
    }
    case "wing_aviator": {
      const has = await pilotHasWingCode(pilotProfileId, [
        "aviator-wings-basic",
      ]);
      if (!has) return { meets: false };
      const already = await prisma.pilotCertificate.count({
        where: { pilotProfileId, templateId: template.id },
      });
      return { meets: already === 0 };
    }
    case "hours_or_perfect_contracts_senior": {
      const perfect = await countPerfectContracts(pilotProfileId);
      const hasWing = await pilotHasWingCode(pilotProfileId, [
        "aviator-wings-senior",
      ]);
      if (perfect < 5 && !hasWing) return { meets: false };
      const already = await prisma.pilotCertificate.count({
        where: { pilotProfileId, templateId: template.id },
      });
      return { meets: already === 0 };
    }
    case "hours_or_perfect_contracts_master": {
      const perfect = await countPerfectContracts(pilotProfileId);
      const hasWing = await pilotHasWingCode(pilotProfileId, [
        "aviator-wings-master",
      ]);
      if (perfect < 10 && !hasWing) return { meets: false };
      const already = await prisma.pilotCertificate.count({
        where: { pilotProfileId, templateId: template.id },
      });
      return { meets: already === 0 };
    }
    default:
      return { meets: false };
  }
}

export type IssueCertificateOptions = {
  notes?: string | null;
  awardGrade?: string | null;
  memberNumber?: string | null;
  issuedAt?: string | Date | null;
};

export async function issueCertificateToPilot(
  issuedByUserId: string,
  pilotProfileId: string,
  templateId: string,
  options: IssueCertificateOptions = {},
): Promise<
  | { ok: true; certificate: AdminPilotCertificateDto }
  | { ok: false; error: string; status: 400 | 404 }
> {
  const pilot = await prisma.pilotProfile.findUnique({
    where: { id: pilotProfileId },
    include: {
      user: { select: { id: true, email: true, memberNumber: true } },
    },
  });
  if (!pilot) {
    return { ok: false, error: "Pilot not found.", status: 404 };
  }

  const template = await prisma.certificateTemplate.findUnique({
    where: { id: templateId },
  });
  if (!template || !template.isActive) {
    return { ok: false, error: "Template not found or inactive.", status: 404 };
  }

  const grade =
    typeof options.awardGrade === "string" && options.awardGrade.trim()
      ? options.awardGrade.trim()
      : null;

  const issuedAt =
    options.issuedAt instanceof Date
      ? options.issuedAt
      : parseManualIssueDate(
          typeof options.issuedAt === "string" ? options.issuedAt : null,
        ) ?? new Date();

  const memberNumberOverride =
    typeof options.memberNumber === "string" && options.memberNumber.trim()
      ? options.memberNumber.trim().replace(/^#\s*/, "")
      : null;

  if (
    (template.layoutKey === "certificate-of-promotion" ||
      template.layoutKey === "captain-promotion" ||
      template.slug === "certificate-of-promotion" ||
      template.slug === "captain-promotion") &&
    !grade
  ) {
    return {
      ok: false,
      error: "Grade / rank is required for this certificate template.",
      status: 400,
    };
  }

  let platformMemberNumber = pilot.user.memberNumber
    ? formatMemberNumber(pilot.user.memberNumber)
    : null;
  if (!platformMemberNumber) {
    platformMemberNumber = await assignMemberNumberToUser(pilot.user.id);
  }

  const overrideIsNumeric =
    memberNumberOverride != null && looksLikeMemberNumber(memberNumberOverride);

  const manualFields = getManualIssueFieldsFromTemplate(template);
  if (
    manualFields.includes("memberNumber") &&
    !overrideIsNumeric &&
    !platformMemberNumber
  ) {
    return {
      ok: false,
      error: "Member number is required for this certificate template.",
      status: 400,
    };
  }

  const certificateNumber = await generateCertificateNumber();
  const memberNumber = overrideIsNumeric
    ? formatMemberNumber(memberNumberOverride!)
    : platformMemberNumber;

  if (!memberNumber) {
    return {
      ok: false,
      error: "Could not resolve a platform member number for this pilot.",
      status: 400,
    };
  }

  let pdfBuffer: Buffer | null = null;
  try {
    const body = applyTemplate(template.bodyTemplate, {
      pilotName: pilot.displayName,
      licenseNumber: memberNumber,
      certificateNumber,
      issueDate: issuedAt.toLocaleDateString("en-US"),
      templateName: template.name,
      gradeOrTitle: grade ?? template.title,
    });

    pdfBuffer = await renderCertificatePdf({
      title: template.title,
      body,
      pilotDisplayName: pilot.displayName,
      certificateNumber,
      issuedAt,
      backgroundImageUrl: template.backgroundImageUrl,
      layoutKey: template.layoutKey ?? template.slug,
      gradeOrTitle: grade,
      memberNumber,
      overlayPositions: parseOverlayPositionsJson(template.overlayPositionsJson),
    });
  } catch (error) {
    console.error("Certificate PDF generation failed; record will still be saved:", error);
  }

  const pdfFileName = `${certificateNumber.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`;
  if (pdfBuffer) {
    try {
      await writeCertificatePdf(pdfFileName, pdfBuffer);
    } catch (error) {
      console.error("Certificate PDF storage failed; record will still be saved:", error);
    }
  }

  const row = await prisma.pilotCertificate.create({
    data: {
      certificateNumber,
      pilotProfileId,
      templateId,
      pilotDisplayName: pilot.displayName,
      licenseNumber: memberNumber,
      awardGrade: grade,
      issuedAt,
      issuedByUserId,
      pdfFileName,
      notes: options.notes?.trim() || null,
    },
    include: { template: { select: { name: true } } },
  });

  notifyAsync(async () => {
    await sendNotification({
      userId: pilot.user.id,
      type: "welcome",
      title: "Certificate issued",
      body: `You received "${template.name}" (Certificate ${certificateNumber}). Download it from your Certificates page.`,
      payload: { certificateId: row.id },
    });
  });

  try {
    await evaluateAndAssignWings(pilotProfileId);
  } catch (error) {
    console.error("Wing evaluation after certificate issue failed:", error);
  }

  return {
    ok: true,
    certificate: {
      ...toPilotCertDto(row),
      pilotEmail: pilot.user.email,
    },
  };
}

export async function revokeCertificateFromPilot(
  certificateId: string,
): Promise<{ ok: true } | { ok: false; error: string; status: 404 }> {
  const existing = await prisma.pilotCertificate.findUnique({
    where: { id: certificateId },
    select: { id: true, pdfFileName: true },
  });
  if (!existing) {
    return { ok: false, error: "Certificate not found.", status: 404 };
  }

  await prisma.pilotCertificate.delete({ where: { id: certificateId } });
  if (existing.pdfFileName) {
    try {
      await deleteCertificatePdf(existing.pdfFileName);
    } catch {
      /* record is already gone */
    }
  }
  return { ok: true };
}

/**
 * Evaluate auto-issue rules and award matching certificates.
 * Call alongside evaluateAndAssignWings when pilot status changes.
 */
export async function evaluateAndIssueCertificates(
  pilotProfileId: string,
): Promise<PilotCertificateDto[]> {
  const pilot = await prisma.pilotProfile.findUnique({
    where: { id: pilotProfileId },
    select: { id: true, userId: true },
  });
  if (!pilot) return [];

  const templates = await prisma.certificateTemplate.findMany({
    where: {
      isActive: true,
      autoRule: { not: "manual_only" },
    },
  });

  const issued: PilotCertificateDto[] = [];

  for (const template of templates) {
    const check = await pilotMeetsCertificateRule(pilotProfileId, template);
    if (!check.meets) continue;

    const result = await issueCertificateToPilot(
      pilot.userId,
      pilotProfileId,
      template.id,
      {
        notes: "Auto-issued by platform certificate rules",
        awardGrade: check.awardGrade ?? null,
      },
    );

    if (result.ok) {
      issued.push(result.certificate);
    }
  }

  return issued;
}

/** Wings first, then certificates (certificates may depend on newly granted wings). */
export async function evaluatePilotAwards(pilotProfileId: string): Promise<void> {
  await evaluateAndAssignWings(pilotProfileId);
  await evaluateAndIssueCertificates(pilotProfileId);
}

export async function getCertificateForPilot(
  certificateId: string,
  pilotProfileId: string,
) {
  return prisma.pilotCertificate.findFirst({
    where: { id: certificateId, pilotProfileId },
  });
}

export async function getCertificateById(certificateId: string) {
  return prisma.pilotCertificate.findUnique({
    where: { id: certificateId },
    include: { template: { select: { name: true } } },
  });
}

type CertificateWithTemplate = PilotCertificate & {
  template: CertificateTemplate;
};

/** Load certificate + full template row for PDF generation or download. */
export async function getCertificateWithTemplate(
  certificateId: string,
): Promise<CertificateWithTemplate | null> {
  return prisma.pilotCertificate.findUnique({
    where: { id: certificateId },
    include: { template: true },
  });
}

async function resolveStoredCertificateMemberNumber(
  cert: CertificateWithTemplate,
): Promise<string | null> {
  if (looksLikeMemberNumber(cert.licenseNumber)) {
    return formatMemberNumber(cert.licenseNumber!);
  }

  const pilot = await prisma.pilotProfile.findUnique({
    where: { id: cert.pilotProfileId },
    select: { user: { select: { id: true, memberNumber: true } } },
  });
  if (!pilot) return null;

  let member = pilot.user.memberNumber
    ? formatMemberNumber(pilot.user.memberNumber)
    : null;
  if (!member) {
    member = await assignMemberNumberToUser(pilot.user.id);
  }

  if (member && cert.licenseNumber !== member) {
    await prisma.pilotCertificate.update({
      where: { id: cert.id },
      data: { licenseNumber: member },
    });
  }

  return member;
}

async function renderStoredCertificatePdf(
  cert: CertificateWithTemplate,
): Promise<Buffer> {
  const template = cert.template;
  const issuedAt =
    cert.issuedAt instanceof Date ? cert.issuedAt : new Date(cert.issuedAt);
  const memberNumber = await resolveStoredCertificateMemberNumber(cert);
  const grade = cert.awardGrade;
  const body = applyTemplate(template.bodyTemplate, {
    pilotName: cert.pilotDisplayName,
    licenseNumber: memberNumber ?? "",
    certificateNumber: cert.certificateNumber,
    issueDate: issuedAt.toLocaleDateString("en-US"),
    templateName: template.name,
    gradeOrTitle: grade ?? template.title,
  });

  return renderCertificatePdf({
    title: template.title,
    body,
    pilotDisplayName: cert.pilotDisplayName,
    certificateNumber: cert.certificateNumber,
    issuedAt,
    backgroundImageUrl: template.backgroundImageUrl,
    layoutKey: template.layoutKey ?? template.slug,
    gradeOrTitle: grade,
    memberNumber: memberNumber ?? undefined,
    overlayPositions: parseOverlayPositionsJson(template.overlayPositionsJson),
  });
}

/** Always render from stored template + pilot data so downloads match the live preview. */
export async function getCertificatePdfBuffer(
  cert: CertificateWithTemplate,
): Promise<Buffer> {
  const buffer = await renderStoredCertificatePdf(cert);
  try {
    await writeCertificatePdf(cert.pdfFileName, buffer);
  } catch {
    // Ephemeral serverless filesystem — regeneration still serves the download.
  }
  return buffer;
}
