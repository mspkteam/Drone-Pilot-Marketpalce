import { prisma } from "@/lib/db";
import { formatDisputeDisplayId } from "@/lib/admin/dispute-center-filters";
import { listDisputesForAdmin } from "@/lib/disputes/dispute";
import { membershipTierRank } from "@/lib/wings/conditions";

export const SQUADRON_BALLOT_WINDOW_MS = 48 * 60 * 60 * 1000;

export type SquadronVote = {
  userId: string;
  vote: "approve" | "reject" | "abstain";
  comment?: string;
  votedAt: string;
};

export type SquadronBallotDto = {
  id: string;
  voteDisplayId: string;
  disputeId: string;
  disputeDisplayId: string;
  missionTitle: string;
  reason: string;
  clientName: string;
  pilotName: string;
  status: "open" | "closed";
  recommendation: string | null;
  votes: SquadronVote[];
  clientVotes: number;
  pilotVotes: number;
  abstainVotes: number;
  votedCount: number;
  squadronMembers: number;
  turnoutPct: number;
  clientPct: number;
  pilotPct: number;
  timeLeftLabel: string;
  urgent: boolean;
  viewerVote: SquadronVote["vote"] | null;
  evidenceHref: string;
  openedByUserId: string | null;
  openedAt: string;
  closedAt: string | null;
};

export type SquadronVotingMetrics = {
  squadronMembers: number;
  activePolls: number;
  avgTurnoutPct: number;
  decisions30d: number;
};

export type SquadronVotingDashboard = {
  ballots: SquadronBallotDto[];
  metrics: SquadronVotingMetrics;
};

export function formatVoteDisplayId(ballotId: string): string {
  const compact = ballotId.replace(/[^a-zA-Z0-9]/g, "");
  return `VOTE-${(compact.slice(-3) || compact.slice(0, 3)).toUpperCase()}`;
}

export function tallySquadronSides(votes: SquadronVote[]): {
  clientVotes: number;
  pilotVotes: number;
  abstainVotes: number;
} {
  return {
    clientVotes: votes.filter((entry) => entry.vote === "approve").length,
    pilotVotes: votes.filter((entry) => entry.vote === "reject").length,
    abstainVotes: votes.filter((entry) => entry.vote === "abstain").length,
  };
}

export function formatBallotTimeLeft(
  openedAt: Date,
  status: string,
  now = Date.now(),
): { label: string; urgent: boolean } {
  if (status === "closed") {
    return { label: "CLOSED", urgent: false };
  }

  const remaining = SQUADRON_BALLOT_WINDOW_MS - (now - openedAt.getTime());
  if (remaining <= 0) {
    return { label: "EXPIRED", urgent: true };
  }

  const totalHours = Math.max(1, Math.floor(remaining / (1000 * 60 * 60)));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0) {
    return { label: `${days}D ${hours}H LEFT`, urgent: false };
  }

  return { label: `${totalHours}H LEFT`, urgent: totalHours <= 12 };
}

export function majorityRecommendation(ballot: {
  clientVotes: number;
  pilotVotes: number;
  clientName: string;
  pilotName: string;
}): string {
  if (ballot.clientVotes === ballot.pilotVotes) {
    return `Squadron vote tied ${ballot.clientVotes}–${ballot.pilotVotes}. Admin closed early; resolve from the dispute thread.`;
  }

  const clientLeads = ballot.clientVotes > ballot.pilotVotes;
  const winner = clientLeads ? ballot.clientName : ballot.pilotName;
  const side = clientLeads ? "client" : "pilot";
  const lead = clientLeads ? ballot.clientVotes : ballot.pilotVotes;
  const trail = clientLeads ? ballot.pilotVotes : ballot.clientVotes;

  return `Squadron majority sided with the ${side} (${winner}), ${lead}–${trail}. Closed early by admin.`;
}

function parseVotes(json: string): SquadronVote[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    return Array.isArray(parsed) ? (parsed as SquadronVote[]) : [];
  } catch {
    return [];
  }
}

type BallotRecord = {
  id: string;
  disputeId: string;
  status: string;
  recommendation: string | null;
  votesJson: string;
  openedByUserId: string | null;
  openedAt: Date;
  closedAt: Date | null;
};

type BallotContext = {
  missionTitle: string;
  reason: string;
  clientName: string;
  pilotName: string;
  squadronMembers: number;
  viewerUserId?: string;
};

function mapBallot(record: BallotRecord, context: BallotContext): SquadronBallotDto {
  const votes = parseVotes(record.votesJson);
  const tallies = tallySquadronSides(votes);
  const decided = tallies.clientVotes + tallies.pilotVotes;
  const clientPct = decided === 0 ? 0 : Math.round((tallies.clientVotes / decided) * 100);
  const pilotPct = decided === 0 ? 0 : 100 - clientPct;
  const squadronMembers = Math.max(context.squadronMembers, 1);
  const time = formatBallotTimeLeft(record.openedAt, record.status);

  return {
    id: record.id,
    voteDisplayId: formatVoteDisplayId(record.id),
    disputeId: record.disputeId,
    disputeDisplayId: formatDisputeDisplayId(record.disputeId),
    missionTitle: context.missionTitle,
    reason: context.reason,
    clientName: context.clientName,
    pilotName: context.pilotName,
    status: record.status as SquadronBallotDto["status"],
    recommendation: record.recommendation,
    votes,
    clientVotes: tallies.clientVotes,
    pilotVotes: tallies.pilotVotes,
    abstainVotes: tallies.abstainVotes,
    votedCount: votes.length,
    squadronMembers: context.squadronMembers,
    turnoutPct: Math.round((votes.length / squadronMembers) * 100),
    clientPct,
    pilotPct,
    timeLeftLabel: time.label,
    urgent: time.urgent,
    viewerVote: votes.find((entry) => entry.userId === context.viewerUserId)?.vote ?? null,
    evidenceHref: `/dashboard/admin/disputes/${record.disputeId}`,
    openedByUserId: record.openedByUserId,
    openedAt: record.openedAt.toISOString(),
    closedAt: record.closedAt?.toISOString() ?? null,
  };
}

async function countSquadronMembers(): Promise<number> {
  const subscriptions = await prisma.pilotSubscription.findMany({
    where: { status: "active" },
    select: { subscriptionPlan: { select: { code: true } } },
  });

  return subscriptions.filter(
    (subscription) => membershipTierRank(subscription.subscriptionPlan.code) >= 4,
  ).length;
}

function contextFromDispute(
  dispute: {
    booking: {
      job: { title: string };
      client: { companyName: string | null; contactName: string };
      pilot: { displayName: string };
    };
    reason: string;
  } | undefined,
  squadronMembers: number,
  viewerUserId?: string,
): BallotContext {
  return {
    missionTitle: dispute?.booking.job.title ?? "Unknown mission",
    reason: dispute?.reason ?? "Dispute",
    clientName:
      dispute?.booking.client.companyName ??
      dispute?.booking.client.contactName ??
      "Client",
    pilotName: dispute?.booking.pilot.displayName ?? "Pilot",
    squadronMembers,
    viewerUserId,
  };
}

export async function getSquadronVotingDashboard(
  viewerUserId: string,
): Promise<SquadronVotingDashboard> {
  const [ballots, disputes, squadronMembers] = await Promise.all([
    prisma.squadronBallot.findMany({ orderBy: { openedAt: "desc" } }),
    listDisputesForAdmin(),
    countSquadronMembers(),
  ]);

  const disputeById = new Map(disputes.map((dispute) => [dispute.id, dispute]));
  const mapped = ballots.map((ballot) =>
    mapBallot(
      ballot,
      contextFromDispute(disputeById.get(ballot.disputeId), squadronMembers, viewerUserId),
    ),
  );

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const closedRecent = mapped.filter(
    (ballot) =>
      ballot.status === "closed" &&
      ballot.closedAt != null &&
      new Date(ballot.closedAt).getTime() >= thirtyDaysAgo,
  );
  const turnoutSample = mapped.filter((ballot) => ballot.votedCount > 0);
  const avgTurnoutPct =
    turnoutSample.length === 0
      ? 0
      : Math.round(
          turnoutSample.reduce((sum, ballot) => sum + ballot.turnoutPct, 0) /
            turnoutSample.length,
        );

  return {
    ballots: mapped,
    metrics: {
      squadronMembers,
      activePolls: mapped.filter((ballot) => ballot.status === "open").length,
      avgTurnoutPct,
      decisions30d: closedRecent.length,
    },
  };
}

export async function getSquadronBallotByDisputeId(
  disputeId: string,
  viewerUserId?: string,
): Promise<SquadronBallotDto | null> {
  const [record, squadronMembers] = await Promise.all([
    prisma.squadronBallot.findUnique({ where: { disputeId } }),
    countSquadronMembers(),
  ]);
  if (!record) return null;

  const disputes = await listDisputesForAdmin();
  const dispute = disputes.find((item) => item.id === disputeId);

  return mapBallot(record, contextFromDispute(dispute, squadronMembers, viewerUserId));
}

export async function openSquadronBallot(
  disputeId: string,
  openedByUserId: string,
): Promise<
  { ok: true; ballot: SquadronBallotDto } | { ok: false; error: string; status?: number }
> {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      booking: {
        include: {
          job: { select: { title: true } },
          clientProfile: { select: { companyName: true, contactName: true } },
          pilotProfile: { select: { displayName: true } },
        },
      },
    },
  });
  if (!dispute) {
    return { ok: false, error: "Dispute not found.", status: 404 };
  }

  const squadronMembers = await countSquadronMembers();
  const context: BallotContext = {
    missionTitle: dispute.booking.job.title,
    reason: dispute.reason,
    clientName:
      dispute.booking.clientProfile.companyName ??
      dispute.booking.clientProfile.contactName,
    pilotName: dispute.booking.pilotProfile.displayName,
    squadronMembers,
    viewerUserId: openedByUserId,
  };

  const existing = await prisma.squadronBallot.findUnique({ where: { disputeId } });
  if (existing) {
    return { ok: true, ballot: mapBallot(existing, context) };
  }

  const record = await prisma.squadronBallot.create({
    data: {
      disputeId,
      openedByUserId,
      status: "open",
    },
  });

  return {
    ok: true,
    ballot: mapBallot(record, context),
  };
}

export async function castSquadronVote(
  ballotId: string,
  userId: string,
  vote: SquadronVote["vote"],
  comment?: string,
): Promise<
  { ok: true; ballot: SquadronBallotDto } | { ok: false; error: string; status?: number }
> {
  const ballot = await prisma.squadronBallot.findUnique({
    where: { id: ballotId },
    include: {
      dispute: {
        include: {
          booking: {
            include: {
              job: { select: { title: true } },
              clientProfile: { select: { companyName: true, contactName: true } },
              pilotProfile: { select: { displayName: true } },
            },
          },
        },
      },
    },
  });
  if (!ballot) {
    return { ok: false, error: "Ballot not found.", status: 404 };
  }
  if (ballot.status !== "open") {
    return { ok: false, error: "Ballot is closed.", status: 409 };
  }

  const votes = parseVotes(ballot.votesJson).filter((entry) => entry.userId !== userId);
  votes.push({
    userId,
    vote,
    comment,
    votedAt: new Date().toISOString(),
  });

  const record = await prisma.squadronBallot.update({
    where: { id: ballotId },
    data: { votesJson: JSON.stringify(votes) },
  });

  const squadronMembers = await countSquadronMembers();
  return {
    ok: true,
    ballot: mapBallot(record, {
      missionTitle: ballot.dispute.booking.job.title,
      reason: ballot.dispute.reason,
      clientName:
        ballot.dispute.booking.clientProfile.companyName ??
        ballot.dispute.booking.clientProfile.contactName,
      pilotName: ballot.dispute.booking.pilotProfile.displayName,
      squadronMembers,
      viewerUserId: userId,
    }),
  };
}

export async function closeSquadronBallotEarly(
  ballotId: string,
  viewerUserId: string,
): Promise<
  { ok: true; ballot: SquadronBallotDto } | { ok: false; error: string; status?: number }
> {
  const ballot = await prisma.squadronBallot.findUnique({ where: { id: ballotId } });
  if (!ballot) {
    return { ok: false, error: "Ballot not found.", status: 404 };
  }

  const dashboard = await getSquadronVotingDashboard(viewerUserId);
  const current = dashboard.ballots.find((entry) => entry.id === ballotId);
  const recommendation = current
    ? majorityRecommendation(current)
    : "Ballot closed early by admin.";

  return closeSquadronBallot(ballotId, recommendation, viewerUserId);
}

export async function closeSquadronBallot(
  ballotId: string,
  recommendation: string,
  viewerUserId?: string,
): Promise<
  { ok: true; ballot: SquadronBallotDto } | { ok: false; error: string; status?: number }
> {
  const ballot = await prisma.squadronBallot.findUnique({
    where: { id: ballotId },
    include: {
      dispute: {
        include: {
          booking: {
            include: {
              job: { select: { title: true } },
              clientProfile: { select: { companyName: true, contactName: true } },
              pilotProfile: { select: { displayName: true } },
            },
          },
        },
      },
    },
  });
  if (!ballot) {
    return { ok: false, error: "Ballot not found.", status: 404 };
  }

  const record = await prisma.squadronBallot.update({
    where: { id: ballotId },
    data: {
      status: "closed",
      recommendation,
      closedAt: new Date(),
    },
  });

  const squadronMembers = await countSquadronMembers();
  return {
    ok: true,
    ballot: mapBallot(record, {
      missionTitle: ballot.dispute.booking.job.title,
      reason: ballot.dispute.reason,
      clientName:
        ballot.dispute.booking.clientProfile.companyName ??
        ballot.dispute.booking.clientProfile.contactName,
      pilotName: ballot.dispute.booking.pilotProfile.displayName,
      squadronMembers,
      viewerUserId,
    }),
  };
}
