import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { notifyAsync, sendNotification } from "@/lib/notifications/notify";
import {
  writePrivateAsset,
  readPrivateAsset,
} from "@/lib/storage/private-asset";
import { grantWingToPilot, ensureDefaultWingDefinitions } from "@/lib/wings/wings";
import {
  emptyWingRequestDocuments,
  getRequestableWingOption,
  isAviatorWingRequestStatus,
  isRequestableWingCode,
  parseWingRequestDocuments,
  serializeWingRequestDocuments,
  validateWingRequestFileBuffer,
  validateWingRequestSubmit,
  WING_REQUEST_MIME_TO_EXT,
  type AviatorWingRequestStatus,
  type RequestableWingCode,
  type WingRequestDocuments,
  type WingRequestFileMeta,
  type WingRequestFileSlot,
} from "@/lib/wings/request-wings";

const FOLDER = "wing-requests";

export type AviatorWingRequestDto = {
  id: string;
  wingCode: RequestableWingCode;
  wingLabel: string;
  status: AviatorWingRequestStatus;
  legalName: string;
  ftn: string;
  totalHours: number | null;
  notes: string;
  confirmation: boolean;
  documents: WingRequestDocuments;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminAviatorWingRequestDto = AviatorWingRequestDto & {
  pilot: {
    id: string;
    displayName: string;
    email: string;
  };
};

export type PilotWingRequestPageDto = {
  draft: AviatorWingRequestDto | null;
  requests: AviatorWingRequestDto[];
  awardedWingCodes: string[];
  displayName: string;
};

type RequestRow = {
  id: string;
  wingCode: string;
  status: string;
  legalName: string;
  ftn: string | null;
  totalHours: number | null;
  notes: string | null;
  confirmation: boolean;
  documentsJson: string;
  rejectionReason: string | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function toDto(row: RequestRow): AviatorWingRequestDto {
  const wingCode = isRequestableWingCode(row.wingCode)
    ? row.wingCode
    : "recreational-aviator-gold";
  const option = getRequestableWingOption(wingCode);
  const status = isAviatorWingRequestStatus(row.status) ? row.status : "draft";

  return {
    id: row.id,
    wingCode,
    wingLabel: option?.label ?? "Wings",
    status,
    legalName: row.legalName,
    ftn: row.ftn ?? "",
    totalHours: row.totalHours,
    notes: row.notes ?? "",
    confirmation: row.confirmation,
    documents: parseWingRequestDocuments(row.documentsJson),
    rejectionReason: row.rejectionReason,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function awardedCodesForPilot(pilotProfileId: string): Promise<Set<string>> {
  const wings = await prisma.pilotWing.findMany({
    where: { pilotProfileId },
    select: { wingDefinition: { select: { code: true } } },
  });
  return new Set(wings.map((row) => row.wingDefinition.code));
}

export async function getPilotWingRequestPage(
  pilotProfileId: string,
  displayName: string,
): Promise<PilotWingRequestPageDto> {
  const [rows, awardedWingCodes] = await Promise.all([
    prisma.aviatorWingRequest.findMany({
      where: { pilotProfileId },
      orderBy: { updatedAt: "desc" },
    }),
    awardedCodesForPilot(pilotProfileId),
  ]);

  const requests = rows.map(toDto);
  const draft = requests.find((row) => row.status === "draft") ?? null;

  return {
    draft,
    requests,
    awardedWingCodes: [...awardedWingCodes],
    displayName,
  };
}

export type SaveWingRequestInput = {
  action: "draft" | "submit";
  wingCode: string;
  legalName: string;
  ftn: string;
  totalHours: number | null;
  notes: string;
  confirmation: boolean;
};

export async function savePilotWingRequest(
  pilotProfileId: string,
  input: SaveWingRequestInput,
): Promise<
  | { ok: true; request: AviatorWingRequestDto }
  | { ok: false; error: string; status: 400 | 403 | 409 | 404 }
> {
  if (!isRequestableWingCode(input.wingCode)) {
    return { ok: false, error: "Select a valid wing type.", status: 400 };
  }

  const awarded = await awardedCodesForPilot(pilotProfileId);
  const existingDraft = await prisma.aviatorWingRequest.findFirst({
    where: { pilotProfileId, status: "draft" },
    orderBy: { updatedAt: "desc" },
  });

  const documents = existingDraft
    ? parseWingRequestDocuments(existingDraft.documentsJson)
    : emptyWingRequestDocuments();

  if (input.action === "submit") {
    const error = validateWingRequestSubmit({
      wingCode: input.wingCode,
      legalName: input.legalName,
      ftn: input.ftn,
      totalHours: input.totalHours,
      notes: input.notes,
      confirmation: input.confirmation,
      documents,
      awardedWingCodes: awarded,
    });
    if (error) {
      return { ok: false, error, status: 400 };
    }

    const pendingSame = await prisma.aviatorWingRequest.findFirst({
      where: {
        pilotProfileId,
        wingCode: input.wingCode,
        status: "pending",
      },
      select: { id: true },
    });
    if (pendingSame) {
      return {
        ok: false,
        error: "A request for these wings is already pending review.",
        status: 409,
      };
    }

    const definition = await prisma.wingDefinition.findUnique({
      where: { code: input.wingCode },
      select: { id: true },
    });
    if (definition && awarded.has(input.wingCode)) {
      return { ok: false, error: "You already hold these wings.", status: 409 };
    }
  }

  const data = {
    wingCode: input.wingCode,
    legalName: input.legalName.trim(),
    ftn: input.ftn.trim() || null,
    totalHours: input.totalHours,
    notes: input.notes.trim() || null,
    confirmation: input.confirmation,
    status: input.action === "submit" ? "pending" : "draft",
    submittedAt: input.action === "submit" ? new Date() : null,
    rejectionReason: null,
    reviewedAt: null,
    reviewedByUserId: null,
  };

  const row = existingDraft
    ? await prisma.aviatorWingRequest.update({
        where: { id: existingDraft.id },
        data,
      })
    : await prisma.aviatorWingRequest.create({
        data: {
          ...data,
          pilotProfileId,
          documentsJson: serializeWingRequestDocuments(documents),
        },
      });

  return { ok: true, request: toDto(row) };
}

function storedName(
  requestId: string,
  slot: WingRequestFileSlot,
  mime: keyof typeof WING_REQUEST_MIME_TO_EXT,
  fileId: string,
) {
  return `${requestId}-${slot}-${fileId}.${WING_REQUEST_MIME_TO_EXT[mime]}`;
}

export async function attachWingRequestFile(
  pilotProfileId: string,
  slot: WingRequestFileSlot,
  file: {
    buffer: Buffer;
    mimeType: string;
    originalFileName: string;
  },
): Promise<
  | { ok: true; request: AviatorWingRequestDto }
  | { ok: false; error: string; status: 400 | 404 }
> {
  const validated = validateWingRequestFileBuffer(file.buffer, file.mimeType);
  if (!validated.ok) {
    return { ok: false, error: validated.error, status: 400 };
  }

  let draft = await prisma.aviatorWingRequest.findFirst({
    where: { pilotProfileId, status: "draft" },
    orderBy: { updatedAt: "desc" },
  });

  if (!draft) {
    draft = await prisma.aviatorWingRequest.create({
      data: {
        pilotProfileId,
        wingCode: "recreational-aviator-gold",
        legalName: "",
        documentsJson: serializeWingRequestDocuments(emptyWingRequestDocuments()),
      },
    });
  }

  const documents = parseWingRequestDocuments(draft.documentsJson);
  const fileId = randomUUID().slice(0, 8);
  const storedFileName = storedName(draft.id, slot, validated.mime, fileId);
  await writePrivateAsset({
    folder: FOLDER,
    fileName: storedFileName,
    buffer: file.buffer,
    contentType: validated.mime,
  });

  const meta: WingRequestFileMeta = {
    id: fileId,
    slot,
    storedFileName,
    originalFileName: file.originalFileName || `${slot}.${WING_REQUEST_MIME_TO_EXT[validated.mime]}`,
    mimeType: validated.mime,
    size: file.buffer.length,
  };

  if (slot === "logbook") {
    documents.logbooks = [...documents.logbooks, meta];
  } else {
    documents[slot] = meta;
  }

  const updated = await prisma.aviatorWingRequest.update({
    where: { id: draft.id },
    data: { documentsJson: serializeWingRequestDocuments(documents) },
  });

  return { ok: true, request: toDto(updated) };
}

export async function getWingRequestFileForAccess(
  requestId: string,
  storedFileName: string,
  actor: { userId: string; role: "pilot" | "admin" },
): Promise<
  | {
      ok: true;
      buffer: Buffer;
      mimeType: string;
      downloadName: string;
    }
  | { ok: false; error: string; status: 403 | 404 }
> {
  const request = await prisma.aviatorWingRequest.findUnique({
    where: { id: requestId },
    include: {
      pilotProfile: { select: { userId: true } },
    },
  });
  if (!request) {
    return { ok: false, error: "Request not found.", status: 404 };
  }
  if (actor.role === "pilot" && request.pilotProfile.userId !== actor.userId) {
    return { ok: false, error: "Request not found.", status: 404 };
  }

  const documents = parseWingRequestDocuments(request.documentsJson);
  const files = [
    documents.iacra,
    documents.testScore,
    documents.certificate,
    ...documents.logbooks,
  ].filter((file): file is WingRequestFileMeta => Boolean(file));
  const match = files.find((file) => file.storedFileName === storedFileName);
  if (!match) {
    return { ok: false, error: "Document not found.", status: 404 };
  }

  try {
    const buffer = await readPrivateAsset(FOLDER, match.storedFileName);
    return {
      ok: true,
      buffer,
      mimeType: match.mimeType,
      downloadName: match.originalFileName,
    };
  } catch {
    return { ok: false, error: "Document not found.", status: 404 };
  }
}

const adminInclude = {
  pilotProfile: {
    include: { user: { select: { email: true } } },
  },
} as const;

function toAdminDto(
  row: RequestRow & {
    pilotProfile: { id: string; displayName: string; user: { email: string } };
  },
): AdminAviatorWingRequestDto {
  return {
    ...toDto(row),
    pilot: {
      id: row.pilotProfile.id,
      displayName: row.pilotProfile.displayName,
      email: row.pilotProfile.user.email,
    },
  };
}

export async function listAviatorWingRequestsForAdmin(
  filter?: AviatorWingRequestStatus | "all",
): Promise<AdminAviatorWingRequestDto[]> {
  const where =
    filter && filter !== "all"
      ? { status: filter }
      : { status: { not: "draft" } };

  const rows = await prisma.aviatorWingRequest.findMany({
    where,
    include: adminInclude,
    orderBy: { submittedAt: "asc" },
  });
  return rows.map(toAdminDto);
}

export async function countPendingAviatorWingRequests() {
  return prisma.aviatorWingRequest.count({ where: { status: "pending" } });
}

export async function reviewAviatorWingRequest(
  requestId: string,
  reviewerUserId: string,
  action: "approve" | "reject",
  reason?: string,
): Promise<
  | { ok: true; request: AdminAviatorWingRequestDto }
  | { ok: false; error: string; status: 400 | 404 | 409 }
> {
  const request = await prisma.aviatorWingRequest.findUnique({
    where: { id: requestId },
    include: adminInclude,
  });
  if (!request) {
    return { ok: false, error: "Request not found.", status: 404 };
  }
  if (request.status !== "pending") {
    return {
      ok: false,
      error: "Only pending requests can be reviewed.",
      status: 409,
    };
  }

  if (action === "reject") {
    const trimmed = reason?.trim() ?? "";
    if (trimmed.length < 5) {
      return {
        ok: false,
        error: "Enter at least 5 characters explaining the denial.",
        status: 400,
      };
    }

    const updated = await prisma.aviatorWingRequest.update({
      where: { id: requestId },
      data: {
        status: "rejected",
        rejectionReason: trimmed,
        reviewedAt: new Date(),
        reviewedByUserId: reviewerUserId,
      },
      include: adminInclude,
    });

    await prisma.aviatorWingRequest.create({
      data: {
        pilotProfileId: request.pilotProfileId,
        wingCode: request.wingCode,
        legalName: request.legalName,
        ftn: request.ftn,
        totalHours: request.totalHours,
        notes: request.notes,
        confirmation: false,
        documentsJson: request.documentsJson,
        status: "draft",
        rejectionReason: trimmed,
      },
    });

    notifyAsync(async () => {
      await sendNotification({
        userId: request.pilotProfile.userId,
        type: "verification_rejected",
        title: "Wings request needs updates",
        body: trimmed,
        payload: { wingRequestId: request.id },
      });
    });

    return { ok: true, request: toAdminDto(updated) };
  }

  if (!isRequestableWingCode(request.wingCode)) {
    return { ok: false, error: "Invalid wing type on this request.", status: 400 };
  }

  await ensureDefaultWingDefinitions();

  const definition = await prisma.wingDefinition.findUnique({
    where: { code: request.wingCode },
    select: { id: true, title: true },
  });
  if (!definition) {
    return {
      ok: false,
      error: "Wing definition is not configured yet.",
      status: 404,
    };
  }

  const granted = await grantWingToPilot(request.pilotProfileId, definition.id, {
    source: "manual",
    assignedByUserId: reviewerUserId,
    metadata: { aviatorWingRequestId: request.id },
  });
  if (!granted.ok) {
    return { ok: false, error: granted.error, status: granted.status };
  }

  const updated = await prisma.aviatorWingRequest.update({
    where: { id: requestId },
    data: {
      status: "approved",
      reviewedAt: new Date(),
      reviewedByUserId: reviewerUserId,
      rejectionReason: null,
    },
    include: adminInclude,
  });

  const { evaluateAndIssueCertificates } = await import(
    "@/lib/certificates/certificate"
  );
  await evaluateAndIssueCertificates(request.pilotProfileId);

  notifyAsync(async () => {
    await sendNotification({
      userId: request.pilotProfile.userId,
      type: "verification_approved",
      title: "Wings request approved",
      body: `${definition.title} has been awarded to your profile.`,
      payload: { wingRequestId: request.id },
    });
  });

  return { ok: true, request: toAdminDto(updated) };
}
