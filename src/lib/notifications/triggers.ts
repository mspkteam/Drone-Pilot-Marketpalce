import { prisma } from "@/lib/db";
import { notifyAsync, sendNotification } from "@/lib/notifications/notify";

async function clientUserIdForJob(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { clientProfile: { select: { userId: true } } },
  });
  return job?.clientProfile.userId ?? null;
}

/** Welcome in-app + email — only after email is confirmed (or auto-verified QA). */
export function triggerWelcome(userId: string, role: string) {
  notifyAsync(async () => {
    const existing = await prisma.notification.findFirst({
      where: { userId, type: "welcome" },
      select: { id: true },
    });
    if (existing) return;

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

    const admins = await prisma.user.findMany({
      where: {
        role: { in: ["super_admin", "admin", "moderator"] },
        status: "active",
      },
      select: { id: true },
    });
    for (const admin of admins) {
      await sendNotification({
        userId: admin.id,
        type: "job_submitted",
        title: "Job needs approval",
        body: `"${jobTitle}" was submitted and is waiting in Job Approval.`,
        payload: { jobId },
        forceEmail: true,
      });
    }
  });
}

export function triggerWingRequestSubmitted(
  pilotDisplayName: string,
  wingCode: string,
  wingRequestId: string,
) {
  notifyAsync(async () => {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ["super_admin", "admin", "moderator"] },
        status: "active",
      },
      select: { id: true },
    });
    for (const admin of admins) {
      await sendNotification({
        userId: admin.id,
        type: "wing_request",
        title: "Wing request pending",
        body: `${pilotDisplayName} requested ${wingCode} wings for review.`,
        payload: { wingRequestId },
        forceEmail: true,
      });
    }
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

export function triggerInstructorStudentInvite(
  inviteeUserId: string,
  instructorName: string,
  inviteId: string,
) {
  notifyAsync(async () => {
    await sendNotification({
      userId: inviteeUserId,
      type: "instructor_invite",
      title: "Instructor invitation",
      body: `${instructorName} invited you to join as their student. Accept or decline on Membership.`,
      payload: { inviteId, instructorName },
    });
  });
}

async function activeStaffUserIds() {
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ["super_admin", "admin", "moderator"] },
      status: "active",
    },
    select: { id: true },
  });
  return admins.map((row) => row.id);
}

/** Squadron ballot opened — email A-4+ voters, parties, and staff. */
export function triggerSquadronBallotOpened(input: {
  ballotId: string;
  disputeId: string;
  bookingId: string;
  missionTitle: string;
  clientUserId: string;
  pilotUserId: string;
  voterUserIds: string[];
}) {
  notifyAsync(async () => {
    const title = "Squadron vote opened";
    const body = `A squadron ballot is open for "${input.missionTitle}". Eligible A-4+ pilots can review evidence and vote.`;
    const partyBody = `Your dispute on "${input.missionTitle}" was escalated to Squadron Voting. Peers will review the case.`;

    for (const userId of [input.clientUserId, input.pilotUserId]) {
      await sendNotification({
        userId,
        type: "squadron_vote",
        title,
        body: partyBody,
        payload: {
          ballotId: input.ballotId,
          disputeId: input.disputeId,
          bookingId: input.bookingId,
        },
        forceEmail: true,
      });
    }

    const partySet = new Set([input.clientUserId, input.pilotUserId]);
    for (const userId of input.voterUserIds) {
      if (partySet.has(userId)) continue;
      await sendNotification({
        userId,
        type: "squadron_vote",
        title,
        body,
        payload: {
          ballotId: input.ballotId,
          disputeId: input.disputeId,
          bookingId: input.bookingId,
        },
        forceEmail: true,
      });
    }

    for (const adminId of await activeStaffUserIds()) {
      await sendNotification({
        userId: adminId,
        type: "squadron_vote",
        title,
        body: `Squadron ballot opened for "${input.missionTitle}".`,
        payload: {
          ballotId: input.ballotId,
          disputeId: input.disputeId,
          bookingId: input.bookingId,
        },
        forceEmail: true,
      });
    }
  });
}

/** Squadron ballot closed — email parties + staff with the recommendation. */
export function triggerSquadronBallotClosed(input: {
  ballotId: string;
  disputeId: string;
  bookingId: string;
  missionTitle: string;
  recommendation: string;
  clientUserId: string;
  pilotUserId: string;
}) {
  notifyAsync(async () => {
    const title = "Squadron vote closed";
    const body = `Squadron voting closed for "${input.missionTitle}". ${input.recommendation}`;

    for (const userId of [input.clientUserId, input.pilotUserId]) {
      await sendNotification({
        userId,
        type: "squadron_vote",
        title,
        body,
        payload: {
          ballotId: input.ballotId,
          disputeId: input.disputeId,
          bookingId: input.bookingId,
        },
        forceEmail: true,
      });
    }

    for (const adminId of await activeStaffUserIds()) {
      await sendNotification({
        userId: adminId,
        type: "squadron_vote",
        title,
        body,
        payload: {
          ballotId: input.ballotId,
          disputeId: input.disputeId,
          bookingId: input.bookingId,
        },
        forceEmail: true,
      });
    }
  });
}
