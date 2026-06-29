import type { BookingDelivery } from "@/generated/prisma/client";
import { updateBookingStatus } from "@/lib/bookings/booking";
import {
  buildStoredDeliveryFileName,
  validateDeliveryFileBuffer,
  writeDeliveryFile,
} from "@/lib/deliveries/storage";
import { DELIVERY_MAX_ITEMS } from "@/lib/deliveries/constants";
import { prisma } from "@/lib/db";
import { triggerBookingStatus } from "@/lib/notifications/triggers";
import type {
  BookingDeliveryDto,
  DeliveryItem,
  DeliveryStatus,
} from "@/types/delivery";

function parseItems(json: string | null | undefined): DeliveryItem[] {
  if (!json?.trim()) return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is DeliveryItem =>
        item != null &&
        typeof item === "object" &&
        typeof (item as DeliveryItem).id === "string" &&
        ((item as DeliveryItem).kind === "file" ||
          (item as DeliveryItem).kind === "link"),
    );
  } catch {
    return [];
  }
}

function serializeItems(items: DeliveryItem[]): string {
  return JSON.stringify(items);
}

export function toDeliveryDto(record: BookingDelivery): BookingDeliveryDto {
  return {
    id: record.id,
    bookingId: record.bookingId,
    status: record.status as DeliveryStatus,
    notes: record.notes,
    items: parseItems(record.filesJson),
    clientFeedback: record.clientFeedback,
    submittedAt: record.submittedAt?.toISOString() ?? null,
    reviewedAt: record.reviewedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function getBookingForPilot(bookingId: string, pilotProfileId: string) {
  return prisma.booking.findFirst({
    where: { id: bookingId, pilotProfileId },
  });
}

async function getBookingForClient(bookingId: string, clientProfileId: string) {
  return prisma.booking.findFirst({
    where: { id: bookingId, clientProfileId },
    include: { job: { select: { title: true } } },
  });
}

export async function getDeliveryForBooking(
  bookingId: string,
): Promise<BookingDeliveryDto | null> {
  const record = await prisma.bookingDelivery.findUnique({
    where: { bookingId },
  });
  return record ? toDeliveryDto(record) : null;
}

async function getOrCreateDeliveryRecord(bookingId: string) {
  const existing = await prisma.bookingDelivery.findUnique({
    where: { bookingId },
  });
  if (existing) return existing;

  return prisma.bookingDelivery.create({
    data: { bookingId },
  });
}

function canPilotEditDelivery(
  bookingStatus: string,
  deliveryStatus: DeliveryStatus,
): boolean {
  if (bookingStatus !== "in_progress") return false;
  return deliveryStatus === "draft" || deliveryStatus === "rejected";
}

export async function addDeliveryLink(
  bookingId: string,
  pilotProfileId: string,
  input: { url: string; label?: string },
): Promise<
  | { ok: true; delivery: BookingDeliveryDto }
  | { ok: false; error: string; status: 400 | 403 | 404 }
> {
  const booking = await getBookingForPilot(bookingId, pilotProfileId);
  if (!booking) {
    return { ok: false, error: "Booking not found.", status: 404 };
  }

  const record = await getOrCreateDeliveryRecord(bookingId);
  const status = record.status as DeliveryStatus;
  if (!canPilotEditDelivery(booking.status, status)) {
    return {
      ok: false,
      error: "Deliverables can only be added while work is in progress.",
      status: 403,
    };
  }

  const url = input.url.trim();
  if (!url || !/^https?:\/\//i.test(url)) {
    return { ok: false, error: "Enter a valid http(s) link.", status: 400 };
  }

  const items = parseItems(record.filesJson);
  if (items.length >= DELIVERY_MAX_ITEMS) {
    return {
      ok: false,
      error: `Maximum ${DELIVERY_MAX_ITEMS} deliverables per submission.`,
      status: 400,
    };
  }

  const nextItems: DeliveryItem[] = [
    ...items,
    {
      id: crypto.randomUUID(),
      kind: "link",
      label: input.label?.trim() || "Deliverable link",
      url,
    },
  ];

  const updated = await prisma.bookingDelivery.update({
    where: { id: record.id },
    data: { filesJson: serializeItems(nextItems), status: "draft" },
  });

  return { ok: true, delivery: toDeliveryDto(updated) };
}

export async function addDeliveryFile(
  bookingId: string,
  pilotProfileId: string,
  input: {
    buffer: Buffer;
    mimeType: string;
    originalFileName: string;
    label?: string;
  },
): Promise<
  | { ok: true; delivery: BookingDeliveryDto }
  | { ok: false; error: string; status: 400 | 403 | 404 }
> {
  const booking = await getBookingForPilot(bookingId, pilotProfileId);
  if (!booking) {
    return { ok: false, error: "Booking not found.", status: 404 };
  }

  const record = await getOrCreateDeliveryRecord(bookingId);
  const status = record.status as DeliveryStatus;
  if (!canPilotEditDelivery(booking.status, status)) {
    return {
      ok: false,
      error: "Deliverables can only be added while work is in progress.",
      status: 403,
    };
  }

  const validated = validateDeliveryFileBuffer(input.buffer, input.mimeType);
  if (!validated.ok) {
    return { ok: false, error: validated.error, status: 400 };
  }

  const items = parseItems(record.filesJson);
  if (items.length >= DELIVERY_MAX_ITEMS) {
    return {
      ok: false,
      error: `Maximum ${DELIVERY_MAX_ITEMS} deliverables per submission.`,
      status: 400,
    };
  }

  const itemId = crypto.randomUUID();
  const storedFileName = buildStoredDeliveryFileName(itemId, validated.mime);
  await writeDeliveryFile(storedFileName, input.buffer);

  const nextItems: DeliveryItem[] = [
    ...items,
    {
      id: itemId,
      kind: "file",
      label: input.label?.trim() || input.originalFileName || "Uploaded file",
      fileName: input.originalFileName,
      mimeType: validated.mime,
      sizeBytes: input.buffer.length,
      storedFileName,
    },
  ];

  const updated = await prisma.bookingDelivery.update({
    where: { id: record.id },
    data: { filesJson: serializeItems(nextItems), status: "draft" },
  });

  return { ok: true, delivery: toDeliveryDto(updated) };
}

export async function updateDeliveryNotes(
  bookingId: string,
  pilotProfileId: string,
  notes: string,
): Promise<
  | { ok: true; delivery: BookingDeliveryDto }
  | { ok: false; error: string; status: 403 | 404 }
> {
  const booking = await getBookingForPilot(bookingId, pilotProfileId);
  if (!booking) {
    return { ok: false, error: "Booking not found.", status: 404 };
  }

  const record = await getOrCreateDeliveryRecord(bookingId);
  const status = record.status as DeliveryStatus;
  if (!canPilotEditDelivery(booking.status, status)) {
    return {
      ok: false,
      error: "Notes can only be edited while work is in progress.",
      status: 403,
    };
  }

  const updated = await prisma.bookingDelivery.update({
    where: { id: record.id },
    data: { notes: notes.trim() || null },
  });

  return { ok: true, delivery: toDeliveryDto(updated) };
}

export async function submitDeliveryForReview(
  bookingId: string,
  pilotProfileId: string,
): Promise<
  | { ok: true; delivery: BookingDeliveryDto }
  | { ok: false; error: string; status: 400 | 403 | 404 }
> {
  const booking = await getBookingForPilot(bookingId, pilotProfileId);
  if (!booking) {
    return { ok: false, error: "Booking not found.", status: 404 };
  }

  if (booking.status !== "in_progress") {
    return {
      ok: false,
      error: "Start work before submitting deliverables.",
      status: 403,
    };
  }

  const record = await getOrCreateDeliveryRecord(bookingId);
  const status = record.status as DeliveryStatus;
  if (status !== "draft" && status !== "rejected") {
    return {
      ok: false,
      error: "This delivery has already been submitted.",
      status: 400,
    };
  }

  const items = parseItems(record.filesJson);
  if (items.length === 0) {
    return {
      ok: false,
      error: "Add at least one file or link before submitting.",
      status: 400,
    };
  }

  const updated = await prisma.bookingDelivery.update({
    where: { id: record.id },
    data: {
      status: "submitted",
      submittedAt: new Date(),
      clientFeedback: null,
      reviewedAt: null,
    },
  });

  const client = await prisma.clientProfile.findUnique({
    where: { id: booking.clientProfileId },
    select: { userId: true },
  });
  if (client) {
    triggerBookingStatus(
      client.userId,
      "Deliverables submitted",
      "Your pilot submitted deliverables for client review.",
      bookingId,
    );
  }

  return { ok: true, delivery: toDeliveryDto(updated) };
}

export async function reviewDelivery(
  bookingId: string,
  clientProfileId: string,
  input: { decision: "approve" | "reject"; feedback?: string },
): Promise<
  | { ok: true; delivery: BookingDeliveryDto }
  | { ok: false; error: string; status: 400 | 403 | 404 }
> {
  const booking = await getBookingForClient(bookingId, clientProfileId);
  if (!booking) {
    return { ok: false, error: "Booking not found.", status: 404 };
  }

  if (booking.status !== "in_progress") {
    return {
      ok: false,
      error: "Deliverables can only be reviewed while work is in progress.",
      status: 403,
    };
  }

  const record = await prisma.bookingDelivery.findUnique({
    where: { bookingId },
  });
  if (!record || record.status !== "submitted") {
    return {
      ok: false,
      error: "No deliverables are waiting for review.",
      status: 400,
    };
  }

  const now = new Date();

  if (input.decision === "reject") {
    const feedback = input.feedback?.trim();
    if (!feedback || feedback.length < 5) {
      return {
        ok: false,
        error: "Provide feedback when requesting revisions.",
        status: 400,
      };
    }

    const updated = await prisma.bookingDelivery.update({
      where: { id: record.id },
      data: {
        status: "rejected",
        clientFeedback: feedback,
        reviewedAt: now,
      },
    });

    const pilot = await prisma.pilotProfile.findUnique({
      where: { id: booking.pilotProfileId },
      select: { userId: true },
    });
    if (pilot) {
      triggerBookingStatus(
        pilot.userId,
        "Revisions requested",
        `The client requested revisions on "${booking.job.title}".`,
        bookingId,
      );
    }

    return { ok: true, delivery: toDeliveryDto(updated) };
  }

  const updated = await prisma.bookingDelivery.update({
    where: { id: record.id },
    data: {
      status: "approved",
      clientFeedback: input.feedback?.trim() || null,
      reviewedAt: now,
    },
  });

  const completeResult = await updateBookingStatus(bookingId, "completed", {
    clientProfileId,
  });

  if (!completeResult.ok) {
    return {
      ok: false,
      error: completeResult.error,
      status: 400,
    };
  }

  return { ok: true, delivery: toDeliveryDto(updated) };
}

export function findDeliveryFileItem(
  delivery: BookingDeliveryDto,
  fileId: string,
): DeliveryItem | null {
  return delivery.items.find((item) => item.id === fileId && item.kind === "file") ?? null;
}

export async function getDeliveryFileForAccess(
  bookingId: string,
  fileId: string,
  options: { pilotProfileId?: string; clientProfileId?: string },
): Promise<
  | {
      ok: true;
      buffer: Buffer;
      mimeType: string;
      downloadName: string;
    }
  | { ok: false; error: string; status: 403 | 404 }
> {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      ...(options.pilotProfileId
        ? { pilotProfileId: options.pilotProfileId }
        : {}),
      ...(options.clientProfileId
        ? { clientProfileId: options.clientProfileId }
        : {}),
    },
  });

  if (!booking) {
    return { ok: false, error: "Booking not found.", status: 404 };
  }

  const delivery = await getDeliveryForBooking(bookingId);
  if (!delivery) {
    return { ok: false, error: "Delivery not found.", status: 404 };
  }

  const item = findDeliveryFileItem(delivery, fileId);
  if (!item?.storedFileName) {
    return { ok: false, error: "File not found.", status: 404 };
  }

  const { readDeliveryFile } = await import("@/lib/deliveries/storage");
  const buffer = await readDeliveryFile(item.storedFileName);

  return {
    ok: true,
    buffer,
    mimeType: item.mimeType ?? "application/octet-stream",
    downloadName: item.fileName ?? item.label,
  };
}
