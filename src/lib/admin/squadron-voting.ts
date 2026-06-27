import { prisma } from "@/lib/db";
import { formatDisputeDisplayId } from "@/lib/admin/dispute-center-filters";
import { listDisputesForAdmin } from "@/lib/disputes/dispute";

export type SquadronVote = {
  userId: string;
  vote: "approve" | "reject" | "abstain";
  comment?: string;
  votedAt: string;
};

export type SquadronBallotDto = {
  id: string;
  disputeId: string;
  disputeDisplayId: string;
  missionTitle: string;
  status: "open" | "closed";
  recommendation: string | null;
  votes: SquadronVote[];
  openedByUserId: string | null;
  openedAt: string;
  closedAt: string | null;
};

function parseVotes(json: string): SquadronVote[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    return Array.isArray(parsed) ? (parsed as SquadronVote[]) : [];
  } catch {
    return [];
  }
}

function mapBallot(
  record: {
    id: string;
    disputeId: string;
    status: string;
    recommendation: string | null;
    votesJson: string;
    openedByUserId: string | null;
    openedAt: Date;
    closedAt: Date | null;
  },
  missionTitle: string,
): SquadronBallotDto {
  return {
    id: record.id,
    disputeId: record.disputeId,
    disputeDisplayId: formatDisputeDisplayId(record.disputeId),
    missionTitle,
    status: record.status as SquadronBallotDto["status"],
    recommendation: record.recommendation,
    votes: parseVotes(record.votesJson),
    openedByUserId: record.openedByUserId,
    openedAt: record.openedAt.toISOString(),
    closedAt: record.closedAt?.toISOString() ?? null,
  };
}

export async function listSquadronBallots(): Promise<SquadronBallotDto[]> {
  const [ballots, disputes] = await Promise.all([
    prisma.squadronBallot.findMany({ orderBy: { openedAt: "desc" } }),
    listDisputesForAdmin(),
  ]);

  const titleByDisputeId = new Map(
    disputes.map((dispute) => [dispute.id, dispute.booking.job.title]),
  );

  return ballots.map((ballot) =>
    mapBallot(ballot, titleByDisputeId.get(ballot.disputeId) ?? "Unknown mission"),
  );
}

export async function openSquadronBallot(
  disputeId: string,
  openedByUserId: string,
): Promise<
  { ok: true; ballot: SquadronBallotDto } | { ok: false; error: string; status?: number }
> {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { booking: { include: { job: { select: { title: true } } } } },
  });
  if (!dispute) {
    return { ok: false, error: "Dispute not found.", status: 404 };
  }

  const existing = await prisma.squadronBallot.findUnique({ where: { disputeId } });
  if (existing) {
    return {
      ok: true,
      ballot: mapBallot(existing, dispute.booking.job.title),
    };
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
    ballot: mapBallot(record, dispute.booking.job.title),
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
    include: { dispute: { include: { booking: { include: { job: true } } } } },
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

  return {
    ok: true,
    ballot: mapBallot(record, ballot.dispute.booking.job.title),
  };
}

export async function closeSquadronBallot(
  ballotId: string,
  recommendation: string,
): Promise<
  { ok: true; ballot: SquadronBallotDto } | { ok: false; error: string; status?: number }
> {
  const ballot = await prisma.squadronBallot.findUnique({
    where: { id: ballotId },
    include: { dispute: { include: { booking: { include: { job: true } } } } },
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

  return {
    ok: true,
    ballot: mapBallot(record, ballot.dispute.booking.job.title),
  };
}
