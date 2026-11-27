import { prisma } from "@/lib/db";
import { formatDisputeDisplayId } from "@/lib/admin/dispute-center-filters";
import { listDisputesForAdmin } from "@/lib/disputes/dispute";
import {
  DISPUTE_AGREEMENT_PERIOD_MS,
  isAgreementPeriodActive,
  isSquadronMinimumMet,
  resolveAgreementEndsAt,
  SQUADRON_MIN_VOTES,
} from "@/lib/disputes/dispute-rules";
import {
  triggerSquadronBallotClosed,
  triggerSquadronBallotOpened,
} from "@/lib/notifications/triggers";
import { membershipTierRank } from "@/lib/wings/conditions";

export const SQUADRON_BALLOT_WINDOW_MS = 48 * 60 * 60 * 1000;

export type SquadronVote = {
  userId: string;
  vote: "approve" | "reject" | "abstain";
  comment?: string;
  votedAt: string;
};

/** Voted / not-voted entry for a Squadron Commander. Admin + commander views only. */
export type SquadronRosterEntry = {
  userId: string;
  name: string;
  voted: boolean;
  votedAt: string | null;
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
  /** Minimum votes needed for a squadron ruling; otherwise Super Admin decides. */
  minVotes: number;
  minVotesMet: boolean;
  /**
   * Voted / not-voted roster. `null` when the viewer is not an admin or an
   * eligible Squadron Commander (never exposed to client/pilot parties).
   */
  roster: SquadronRosterEntry[] | null;
  notVotedCount: number | null;
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

export function buildSquadronRoster(
  voterUserIds: string[],
  nameByUserId: Map<string, string>,
  votes: SquadronVote[],
): SquadronRosterEntry[] {
  const voteByUser = new Map(votes.map((entry) => [entry.userId, entry]));
  const roster = voterUserIds.map((userId) => {
    const vote = voteByUser.get(userId);
    return {
      userId,
      name: nameByUserId.get(userId) ?? "Squadron Commander",
      voted: Boolean(vote),
      votedAt: vote?.votedAt ?? null,
    };
  });
  // Not-voted first so outstanding commanders are easy to chase; then by name.
  return roster.sort(
    (a, b) => Number(a.voted) - Number(b.voted) || a.name.localeCompare(b.name),
  );
}

export function minimumVotesRecommendation(
  votedCount: number,
  minVotes = SQUADRON_MIN_VOTES,
): string {
  return `Squadron minimum not reached (${votedCount}/${minVotes} votes). Super Admin decides this dispute.`;
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
  closedBy?: "admin" | "expiry";
}): string {
  const closeNote =
    ballot.closedBy === "expiry" ? "Voting window ended." : "Closed early by admin.";
  if (ballot.clientVotes === ballot.pilotVotes) {
    return `Squadron vote tied ${ballot.clientVotes}–${ballot.pilotVotes}. ${closeNote} Resolve from the dispute thread.`;
  }

  const clientLeads = ballot.clientVotes > ballot.pilotVotes;
  const winner = clientLeads ? ballot.clientName : ballot.pilotName;
  const side = clientLeads ? "client" : "pilot";
  const lead = clientLeads ? ballot.clientVotes : ballot.pilotVotes;
  const trail = clientLeads ? ballot.pilotVotes : ballot.clientVotes;

  return `Squadron majority sided with the ${side} (${winner}), ${lead}–${trail}. ${closeNote}`;
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
  roster?: SquadronRosterEntry[] | null;
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
    minVotes: SQUADRON_MIN_VOTES,
    minVotesMet: isSquadronMinimumMet(votes.length),
    roster: context.roster ?? null,
    notVotedCount: context.roster
      ? context.roster.filter((entry) => !entry.voted).length
      : null,
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

async function listSquadronVoterUserIds(
  excludeUserIds: string[] = [],
): Promise<string[]> {
  const subscriptions = await prisma.pilotSubscription.findMany({
    where: { status: "active" },
    select: {
      subscriptionPlan: { select: { code: true } },
      pilotProfile: { select: { userId: true } },
    },
  });

  const exclude = new Set(excludeUserIds.filter(Boolean));
  const ids: string[] = [];
  for (const subscription of subscriptions) {
    if (membershipTierRank(subscription.subscriptionPlan.code) < 4) continue;
    const userId = subscription.pilotProfile.userId;
    if (!userId || exclude.has(userId)) continue;
    ids.push(userId);
  }
  return [...new Set(ids)];
}

async function countSquadronMembers(): Promise<number> {
  return (await listSquadronVoterUserIds()).length;
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

async function loadVoterNames(userIds: string[]): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();
  const profiles = await prisma.pilotProfile.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, displayName: true },
  });
  return new Map(profiles.map((profile) => [profile.userId, profile.displayName]));
}

let lastSquadronSweepAt = 0;
const SQUADRON_SWEEP_INTERVAL_MS = 30 * 1000;

/**
 * Lazy "cron": auto-opens squadron votes once the 3-day agreement period ends,
 * and closes expired (48h) ballots — with the Super Admin deciding if the
 * minimum vote count was not reached.
 */
export async function processDueSquadronBallots(
  now = Date.now(),
  force = false,
): Promise<{ opened: number; closed: number }> {
  if (!force && now - lastSquadronSweepAt < SQUADRON_SWEEP_INTERVAL_MS) {
    return { opened: 0, closed: 0 };
  }
  lastSquadronSweepAt = now;

  let opened = 0;
  let closed = 0;

  const dueDisputes = await prisma.dispute.findMany({
    where: {
      status: { not: "resolved" },
      squadronBallot: null,
      OR: [
        { agreementEndsAt: { lte: new Date(now) } },
        {
          agreementEndsAt: null,
          createdAt: { lte: new Date(now - DISPUTE_AGREEMENT_PERIOD_MS) },
        },
      ],
    },
    select: { id: true },
  });
  for (const dispute of dueDisputes) {
    const result = await openSquadronBallot(dispute.id, null);
    if (result.ok) opened += 1;
  }

  const expired = await prisma.squadronBallot.findMany({
    where: {
      status: "open",
      openedAt: { lte: new Date(now - SQUADRON_BALLOT_WINDOW_MS) },
    },
    include: {
      dispute: {
        include: {
          booking: {
            include: {
              clientProfile: { select: { companyName: true, contactName: true } },
              pilotProfile: { select: { displayName: true } },
            },
          },
        },
      },
    },
  });
  for (const ballot of expired) {
    const votes = parseVotes(ballot.votesJson);
    const tallies = tallySquadronSides(votes);
    const recommendation = isSquadronMinimumMet(votes.length)
      ? majorityRecommendation({
          ...tallies,
          clientName:
            ballot.dispute.booking.clientProfile.companyName ??
            ballot.dispute.booking.clientProfile.contactName,
          pilotName: ballot.dispute.booking.pilotProfile.displayName,
          closedBy: "expiry",
        })
      : minimumVotesRecommendation(votes.length);
    const result = await closeSquadronBallot(ballot.id, recommendation);
    if (result.ok) closed += 1;
  }

  return { opened, closed };
}

export async function getSquadronVotingDashboard(
  viewerUserId: string,
  options: { includeRoster?: boolean } = {},
): Promise<SquadronVotingDashboard> {
  const includeRoster = options.includeRoster ?? true;
  await processDueSquadronBallots();

  const [ballots, disputes, voterUserIds] = await Promise.all([
    prisma.squadronBallot.findMany({
      orderBy: { openedAt: "desc" },
      include: {
        dispute: {
          select: {
            booking: {
              select: {
                clientProfile: { select: { userId: true } },
                pilotProfile: { select: { userId: true } },
              },
            },
          },
        },
      },
    }),
    listDisputesForAdmin(),
    listSquadronVoterUserIds(),
  ]);
  const squadronMembers = voterUserIds.length;
  const nameByUserId = includeRoster
    ? await loadVoterNames(voterUserIds)
    : new Map<string, string>();

  const disputeById = new Map(disputes.map((dispute) => [dispute.id, dispute]));
  const mapped = ballots.map((ballot) => {
    const roster = includeRoster
      ? buildSquadronRoster(
          voterUserIds.filter(
            (id) =>
              id !== ballot.dispute.booking.clientProfile.userId &&
              id !== ballot.dispute.booking.pilotProfile.userId,
          ),
          nameByUserId,
          parseVotes(ballot.votesJson),
        )
      : null;
    return mapBallot(ballot, {
      ...contextFromDispute(
        disputeById.get(ballot.disputeId),
        squadronMembers,
        viewerUserId,
      ),
      roster,
    });
  });

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

/** Admin-only callers may pass `includeRoster` to expose the voted / not-voted roster. */
export async function getSquadronBallotByDisputeId(
  disputeId: string,
  viewerUserId?: string,
  options: { includeRoster?: boolean } = {},
): Promise<SquadronBallotDto | null> {
  await processDueSquadronBallots();

  const [record, voterUserIds] = await Promise.all([
    prisma.squadronBallot.findUnique({
      where: { disputeId },
      include: {
        dispute: {
          select: {
            booking: {
              select: {
                clientProfile: { select: { userId: true } },
                pilotProfile: { select: { userId: true } },
              },
            },
          },
        },
      },
    }),
    listSquadronVoterUserIds(),
  ]);
  if (!record) return null;

  const disputes = await listDisputesForAdmin();
  const dispute = disputes.find((item) => item.id === disputeId);

  let roster: SquadronRosterEntry[] | null = null;
  if (options.includeRoster) {
    const eligible = voterUserIds.filter(
      (id) =>
        id !== record.dispute.booking.clientProfile.userId &&
        id !== record.dispute.booking.pilotProfile.userId,
    );
    roster = buildSquadronRoster(
      eligible,
      await loadVoterNames(eligible),
      parseVotes(record.votesJson),
    );
  }

  return mapBallot(record, {
    ...contextFromDispute(dispute, voterUserIds.length, viewerUserId),
    roster,
  });
}

export async function openSquadronBallot(
  disputeId: string,
  /** `null` when auto-opened after the 3-day agreement period. */
  openedByUserId: string | null,
): Promise<
  { ok: true; ballot: SquadronBallotDto } | { ok: false; error: string; status?: number }
> {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      booking: {
        include: {
          job: { select: { title: true } },
          clientProfile: {
            select: { companyName: true, contactName: true, userId: true },
          },
          pilotProfile: { select: { displayName: true, userId: true } },
        },
      },
    },
  });
  if (!dispute) {
    return { ok: false, error: "Dispute not found.", status: 404 };
  }

  const agreementEndsAt = resolveAgreementEndsAt(dispute);
  if (isAgreementPeriodActive(agreementEndsAt)) {
    return {
      ok: false,
      error: `Squadron voting cannot start until the 3-day agreement period ends (${agreementEndsAt.toISOString()}).`,
      status: 409,
    };
  }

  const clientUserId = dispute.booking.clientProfile.userId;
  const pilotUserId = dispute.booking.pilotProfile.userId;
  const voterUserIds = await listSquadronVoterUserIds([
    clientUserId,
    pilotUserId,
  ]);
  const squadronMembers = voterUserIds.length;
  const context: BallotContext = {
    missionTitle: dispute.booking.job.title,
    reason: dispute.reason,
    clientName:
      dispute.booking.clientProfile.companyName ??
      dispute.booking.clientProfile.contactName,
    pilotName: dispute.booking.pilotProfile.displayName,
    squadronMembers,
    viewerUserId: openedByUserId ?? undefined,
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

  triggerSquadronBallotOpened({
    ballotId: record.id,
    disputeId,
    bookingId: dispute.bookingId,
    missionTitle: dispute.booking.job.title,
    clientUserId,
    pilotUserId,
    voterUserIds,
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
              clientProfile: {
                select: { companyName: true, contactName: true, userId: true },
              },
              pilotProfile: { select: { displayName: true, userId: true } },
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

  const partyUserIds = new Set(
    [
      ballot.dispute.booking.clientProfile.userId,
      ballot.dispute.booking.pilotProfile.userId,
    ].filter(Boolean),
  );
  if (partyUserIds.has(userId)) {
    return {
      ok: false,
      error: "Parties to the dispute cannot cast a squadron vote.",
      status: 403,
    };
  }

  const voterUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  const isStaffVoter =
    voterUser?.role === "admin" ||
    voterUser?.role === "super_admin" ||
    voterUser?.role === "moderator";

  if (!isStaffVoter) {
    const voterPilot = await prisma.pilotProfile.findFirst({
      where: { userId },
      select: {
        subscriptions: {
          where: { status: "active" },
          take: 1,
          select: { subscriptionPlan: { select: { code: true } } },
        },
      },
    });
    const voterRank = membershipTierRank(
      voterPilot?.subscriptions[0]?.subscriptionPlan.code,
    );
    if (voterRank < 4) {
      return {
        ok: false,
        error: "Squadron voting requires grade A-4 or higher.",
        status: 403,
      };
    }
  }

  const existingVotes = parseVotes(ballot.votesJson);
  if (existingVotes.some((entry) => entry.userId === userId)) {
    return {
      ok: false,
      error: "You have already voted on this ballot.",
      status: 409,
    };
  }

  const votes = [
    ...existingVotes,
    {
      userId,
      vote,
      comment,
      votedAt: new Date().toISOString(),
    },
  ];

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
  const recommendation = !current
    ? "Ballot closed early by admin."
    : current.minVotesMet
      ? majorityRecommendation(current)
      : minimumVotesRecommendation(current.votedCount);

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
              clientProfile: {
                select: { companyName: true, contactName: true, userId: true },
              },
              pilotProfile: { select: { displayName: true, userId: true } },
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
  triggerSquadronBallotClosed({
    ballotId: record.id,
    disputeId: ballot.disputeId,
    bookingId: ballot.dispute.bookingId,
    missionTitle: ballot.dispute.booking.job.title,
    recommendation,
    clientUserId: ballot.dispute.booking.clientProfile.userId,
    pilotUserId: ballot.dispute.booking.pilotProfile.userId,
  });

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
