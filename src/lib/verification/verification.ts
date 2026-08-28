import type { Verification } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { notifyAsync, sendNotification } from "@/lib/notifications/notify";
import { evaluatePilotAwards } from "@/lib/certificates/awards";
import { parseProfileExtrasJson } from "@/lib/pilot/profile-extras";
import {
  buildStoredFileName,
  readVerificationFile,
  validateVerificationFileBuffer,
  writeVerificationFile,
} from "@/lib/verification/storage";
import type {
  AdminVerificationDto,
  VerificationDto,
  VerificationStatus,
  VerificationType,
} from "@/types/verification";
import {
  VERIFICATION_STATUSES,
  VERIFICATION_TYPES,
} from "@/types/verification";
import { isAdminRole, type UserRole } from "@/types/roles";

export function toVerificationDto(v: Verification): VerificationDto {
  return {
    id: v.id,
    pilotProfileId: v.pilotProfileId,
    type: v.type as VerificationType,
    documentUrl: v.documentUrl,
    documentFileName: v.documentFileName,
    documentMimeType: v.documentMimeType,
    originalFileName: v.originalFileName,
    hasUploadedDocument: Boolean(v.documentFileName),
    notes: v.notes,
    status: v.status as VerificationStatus,
    submittedAt: v.submittedAt.toISOString(),
    reviewedAt: v.reviewedAt?.toISOString() ?? null,
    reviewedByUserId: v.reviewedByUserId,
    rejectionReason: v.rejectionReason,
    expiresAt: v.expiresAt?.toISOString() ?? null,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  };
}

const adminInclude = {
  pilotProfile: {
    include: { user: { select: { email: true } } },
  },
} as const;

function toAdminDto(
  v: Verification & {
    pilotProfile: {
      id: string;
      displayName: string;
      licenseNumber: string;
      licenseCountry: string | null;
      locationCity: string | null;
      locationRegion: string | null;
      locationCountry: string | null;
      profileExtrasJson: string;
      user: { email: string };
    };
  },
): AdminVerificationDto {
  return {
    ...toVerificationDto(v),
    pilot: {
      id: v.pilotProfile.id,
      displayName: v.pilotProfile.displayName,
      email: v.pilotProfile.user.email,
      licenseNumber: v.pilotProfile.licenseNumber,
      licenseCountry: v.pilotProfile.licenseCountry,
      locationCity: v.pilotProfile.locationCity,
      locationRegion: v.pilotProfile.locationRegion,
      locationCountry: v.pilotProfile.locationCountry,
      avatarUrl: parseProfileExtrasJson(v.pilotProfile.profileExtrasJson)
        .avatarUrl,
    },
  };
}

export async function listVerificationsForPilot(pilotProfileId: string) {
  const rows = await prisma.verification.findMany({
    where: { pilotProfileId },
    orderBy: { submittedAt: "desc" },
  });
  return rows.map(toVerificationDto);
}

export async function listVerificationsForAdmin(
  filter?: VerificationStatus | "all",
): Promise<AdminVerificationDto[]> {
  const where =
    filter && filter !== "all" ? { status: filter } : undefined;

  const rows = await prisma.verification.findMany({
    where,
    include: adminInclude,
    orderBy: { submittedAt: "desc" },
  });

  return rows.map(toAdminDto);
}

export async function countPendingVerifications() {
  return prisma.verification.count({ where: { status: "pending" } });
}

export async function getApprovedVerificationTypes(
  pilotProfileId: string,
): Promise<VerificationType[]> {
  const rows = await prisma.verification.findMany({
    where: { pilotProfileId, status: "approved" },
    select: { type: true },
    distinct: ["type"],
  });
  return rows.map((r) => r.type as VerificationType);
}

export function validateVerificationUrlInput(body: {
  type?: string;
  documentUrl?: string;
  notes?: string | null;
}):
  | { ok: true; type: VerificationType; documentUrl: string; notes: string | null }
  | { ok: false; error: string } {
  const type = body.type;
  if (!type || !VERIFICATION_TYPES.includes(type as VerificationType)) {
    return { ok: false, error: "Valid verification type is required." };
  }

  const documentUrl = body.documentUrl?.trim();
  if (!documentUrl || documentUrl.length < 8) {
    return {
      ok: false,
      error: "Document link or reference (min 8 characters) is required.",
    };
  }

  if (documentUrl.length > 500) {
    return { ok: false, error: "Document reference is too long." };
  }

  const notes = body.notes?.trim() || null;
  if (notes && notes.length > 500) {
    return { ok: false, error: "Notes are too long." };
  }

  return {
    ok: true,
    type: type as VerificationType,
    documentUrl,
    notes,
  };
}

export async function submitVerificationWithUrl(
  pilotProfileId: string,
  input: { type: VerificationType; documentUrl: string; notes: string | null },
): Promise<
  | { ok: true; verification: VerificationDto }
  | { ok: false; error: string; status: 400 | 409 }
> {
  return submitVerificationRecord(pilotProfileId, {
    type: input.type,
    notes: input.notes,
    documentUrl: input.documentUrl,
    documentFileName: null,
    documentMimeType: null,
    originalFileName: null,
  });
}

export async function submitVerificationWithFile(
  pilotProfileId: string,
  input: {
    type: VerificationType;
    notes: string | null;
    buffer: Buffer;
    mimeType: string;
    originalFileName: string;
  },
): Promise<
  | { ok: true; verification: VerificationDto }
  | { ok: false; error: string; status: 400 | 409 }
> {
  const fileCheck = validateVerificationFileBuffer(input.buffer, input.mimeType);
  if (!fileCheck.ok) {
    return { ok: false, error: fileCheck.error, status: 400 };
  }

  if (input.notes && input.notes.length > 500) {
    return { ok: false, error: "Notes are too long.", status: 400 };
  }

  const pending = await prisma.verification.findFirst({
    where: {
      pilotProfileId,
      type: input.type,
      status: "pending",
    },
  });

  if (pending) {
    return {
      ok: false,
      error: `You already have a pending ${input.type} verification.`,
      status: 409,
    };
  }

  const row = await prisma.verification.create({
    data: {
      pilotProfileId,
      type: input.type,
      notes: input.notes,
      status: "pending",
    },
  });

  const storedName = buildStoredFileName(row.id, fileCheck.mime);
  await writeVerificationFile(storedName, input.buffer);

  const updated = await prisma.verification.update({
    where: { id: row.id },
    data: {
      documentFileName: storedName,
      documentMimeType: fileCheck.mime,
      originalFileName: input.originalFileName.slice(0, 255),
    },
  });

  return { ok: true, verification: toVerificationDto(updated) };
}

async function submitVerificationRecord(
  pilotProfileId: string,
  data: {
    type: VerificationType;
    notes: string | null;
    documentUrl: string | null;
    documentFileName: string | null;
    documentMimeType: string | null;
    originalFileName: string | null;
  },
): Promise<
  | { ok: true; verification: VerificationDto }
  | { ok: false; error: string; status: 400 | 409 }
> {
  if (!data.documentUrl && !data.documentFileName) {
    return {
      ok: false,
      error: "Upload a document file or provide a document link.",
      status: 400,
    };
  }

  const existingPending = await prisma.verification.findFirst({
    where: {
      pilotProfileId,
      type: data.type,
      status: "pending",
    },
  });

  if (existingPending) {
    return {
      ok: false,
      error: `You already have a pending ${data.type} verification.`,
      status: 409,
    };
  }

  const row = await prisma.verification.create({
    data: {
      pilotProfileId,
      type: data.type,
      documentUrl: data.documentUrl,
      documentFileName: data.documentFileName,
      documentMimeType: data.documentMimeType,
      originalFileName: data.originalFileName,
      notes: data.notes,
      status: "pending",
    },
  });

  return { ok: true, verification: toVerificationDto(row) };
}

/** @deprecated Use submitVerificationWithUrl â€” kept for route compatibility */
export async function submitVerification(
  pilotProfileId: string,
  input: { type: VerificationType; documentUrl: string; notes: string | null },
) {
  return submitVerificationWithUrl(pilotProfileId, input);
}

export function validateVerificationInput(body: {
  type?: string;
  documentUrl?: string;
  notes?: string | null;
}) {
  return validateVerificationUrlInput(body);
}

export async function getVerificationForPilot(
  verificationId: string,
  pilotProfileId: string,
) {
  const row = await prisma.verification.findFirst({
    where: { id: verificationId, pilotProfileId },
  });
  return row ? toVerificationDto(row) : null;
}

export async function getVerificationDocumentForAccess(
  verificationId: string,
  userId: string,
  role: UserRole,
): Promise<
  | {
      ok: true;
      buffer: Buffer;
      mimeType: string;
      downloadName: string;
    }
  | { ok: false; error: string; status: 403 | 404 }
> {
  const row = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: { pilotProfile: { select: { userId: true } } },
  });

  if (!row || !row.documentFileName || !row.documentMimeType) {
    return { ok: false, error: "Document not found.", status: 404 };
  }

  const isOwner = row.pilotProfile.userId === userId;
  const isAdmin = isAdminRole(role);

  if (!isOwner && !isAdmin) {
    return { ok: false, error: "Access denied.", status: 403 };
  }

  try {
    const buffer = await readVerificationFile(row.documentFileName);
    const downloadName =
      row.originalFileName ??
      `${row.type}-verification.${row.documentFileName.split(".").pop()}`;

    return {
      ok: true,
      buffer,
      mimeType: row.documentMimeType,
      downloadName,
    };
  } catch {
    return { ok: false, error: "Document file not found.", status: 404 };
  }
}

export async function approveVerification(
  verificationId: string,
  reviewerUserId: string,
): Promise<
  | { ok: true }
  | { ok: false; error: string; status: 400 | 404 }
> {
  const row = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: { pilotProfile: { select: { userId: true, displayName: true } } },
  });

  if (!row) {
    return { ok: false, error: "Verification not found.", status: 404 };
  }

  if (row.status !== "pending") {
    return {
      ok: false,
      error: "Only pending verifications can be approved.",
      status: 400,
    };
  }

  const now = new Date();
  await prisma.verification.update({
    where: { id: verificationId },
    data: {
      status: "approved",
      reviewedAt: now,
      reviewedByUserId: reviewerUserId,
      rejectionReason: null,
    },
  });

  notifyAsync(async () => {
    await sendNotification({
      userId: row.pilotProfile.userId,
      type: "verification_approved",
      title: "Verification approved",
      body: `Your ${row.type} verification was approved.`,
      payload: { verificationId },
    });
  });

  await evaluatePilotAwards(row.pilotProfileId);

  return { ok: true };
}

export async function rejectVerification(
  verificationId: string,
  reviewerUserId: string,
  rejectionReason: string,
): Promise<
  | { ok: true }
  | { ok: false; error: string; status: 400 | 404 }
> {
  const row = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: { pilotProfile: { select: { userId: true } } },
  });

  if (!row) {
    return { ok: false, error: "Verification not found.", status: 404 };
  }

  if (row.status !== "pending") {
    return {
      ok: false,
      error: "Only pending verifications can be rejected.",
      status: 400,
    };
  }

  const reason = rejectionReason.trim();
  if (reason.length < 5) {
    return {
      ok: false,
      error: "Rejection reason is required (min 5 characters).",
      status: 400,
    };
  }

  const now = new Date();
  await prisma.verification.update({
    where: { id: verificationId },
    data: {
      status: "rejected",
      reviewedAt: now,
      reviewedByUserId: reviewerUserId,
      rejectionReason: reason,
    },
  });

  notifyAsync(async () => {
    await sendNotification({
      userId: row.pilotProfile.userId,
      type: "verification_rejected",
      title: "Verification needs updates",
      body: `Your ${row.type} verification was rejected: ${reason}`,
      payload: { verificationId, reason },
    });
  });

  return { ok: true };
}

export function isValidVerificationFilter(
  value: string,
): value is VerificationStatus | "all" {
  return (
    value === "all" ||
    VERIFICATION_STATUSES.includes(value as VerificationStatus)
  );
}

export function parseVerificationMultipart(formData: FormData): {
  type: string;
  notes: string | null;
  file: File | null;
  documentUrl: string | null;
} {
  const type = String(formData.get("type") ?? "");
  const notesRaw = formData.get("notes");
  const notes =
    typeof notesRaw === "string" && notesRaw.trim()
      ? notesRaw.trim()
      : null;
  const fileEntry = formData.get("file");
  const file =
    fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;
  const urlRaw = formData.get("documentUrl");
  const documentUrl =
    typeof urlRaw === "string" && urlRaw.trim() ? urlRaw.trim() : null;

  return { type, notes, file, documentUrl };
}
