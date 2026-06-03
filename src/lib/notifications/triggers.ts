import { prisma } from "@/lib/db";
import { notifyAsync, sendNotification } from "@/lib/notifications/notify";

async function clientUserIdForJob(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { clientProfile: { select: { userId: true } } },
  });
  return job?.clientProfile.userId ?? null;
}

export function triggerWelcome(userId: string, role: string) {
  notifyAsync(async () => {
    await sendNotification({
      userId,
      type: "welcome",
      title: "Welcome to Drone Pilot Marketplace",
      body: `Your ${role} account is ready. Complete your profile to get started.`,
      payload: { role },
    });
  });
}

export function triggerJobSubmitted(clientUserId: string, jobTitle: string, jobId: string) {
  notifyAsync(async () => {
    await sendNotification({
      userId: clientUserId,
      type: "job_submitted",
      title: "Job submitted for approval",
      body: `"${jobTitle}" is pending admin review.`,
      payload: { jobId },
    });
  });
}

export function triggerJobApproved(jobId: string, jobTitle: string) {
  notifyAsync(async () => {
    const userId = await clientUserIdForJob(jobId);
    if (!userId) return;
    await sendNotification({
      userId,
      type: "job_approved",
      title: "Job approved",
      body: `"${jobTitle}" is now open for pilot applications.`,
      payload: { jobId },
    });
  });
}

export function triggerJobRejected(
  jobId: string,
  jobTitle: string,
  reason: string,
) {
  notifyAsync(async () => {
    const userId = await clientUserIdForJob(jobId);
    if (!userId) return;
    await sendNotification({
      userId,
      type: "job_rejected",
      title: "Job needs changes",
      body: `"${jobTitle}" was rejected: ${reason}`,
      payload: { jobId, reason },
    });
  });
}

export function triggerBidReceived(
  jobId: string,
  jobTitle: string,
  pilotName: string,
) {
  notifyAsync(async () => {
    const userId = await clientUserIdForJob(jobId);
    if (!userId) return;
    await sendNotification({
      userId,
      type: "bid_received",
      title: "New pilot offer",
      body: `${pilotName} submitted an offer on "${jobTitle}".`,
      payload: { jobId },
    });
  });
}

export function triggerBidAccepted(
  pilotUserId: string,
  jobTitle: string,
  bookingId: string,
) {
  notifyAsync(async () => {
    await sendNotification({
      userId: pilotUserId,
      type: "bid_accepted",
      title: "Your offer was accepted",
      body: `The client accepted your bid on "${jobTitle}". A booking has been created.`,
      payload: { bookingId },
    });
  });
}

export function triggerBookingStatus(
  userId: string,
  title: string,
  body: string,
  bookingId: string,
) {
  notifyAsync(async () => {
    await sendNotification({
      userId,
      type: "booking_status",
      title,
      body,
      payload: { bookingId },
    });
  });
}

export function triggerBookingCompleted(
  clientUserId: string,
  pilotUserId: string,
  jobTitle: string,
  bookingId: string,
) {
  notifyAsync(async () => {
    const body = `"${jobTitle}" is complete. Payment and commission records have been created.`;
    await sendNotification({
      userId: clientUserId,
      type: "booking_completed",
      title: "Booking completed",
      body,
      payload: { bookingId },
    });
    await sendNotification({
      userId: pilotUserId,
      type: "booking_completed",
      title: "Booking completed",
      body: `Great work on "${jobTitle}". Your payout record is available under Payments.`,
      payload: { bookingId },
    });
  });
}

export function triggerReviewReceived(
  targetUserId: string,
  rating: number,
  jobTitle: string,
  bookingId: string,
) {
  notifyAsync(async () => {
    await sendNotification({
      userId: targetUserId,
      type: "review_received",
      title: "New review",
      body: `You received a ${rating}-star review for "${jobTitle}".`,
      payload: { bookingId, rating },
    });
  });
}
