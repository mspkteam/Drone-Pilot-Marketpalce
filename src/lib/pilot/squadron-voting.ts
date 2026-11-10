import "server-only";

import {
  castSquadronVote,
  getSquadronVotingDashboard,
  type SquadronBallotDto,
  type SquadronVotingDashboard,
  type SquadronVote,
} from "@/lib/admin/squadron-voting";
import { prisma } from "@/lib/db";
import { membershipTierRank } from "@/lib/wings/conditions";

export type PilotSquadronEvidenceEntry = {
  id: string;
  body: string;
  createdAt: string;
  authorLabel: string;
};

export type PilotSquadronEvidence = {
  ballotId: string;
  missionTitle: string;
  reason: string;
  clientName: string;
  pilotName: string;
  entries: PilotSquadronEvidenceEntry[];
};

export type PilotSquadronVotingDashboard = SquadronVotingDashboard & {
  eligible: boolean;
  gradeLabel: string;
  isPartyOnOpenBallot: boolean;
};

export async function getPilotSquadronGrade(userId: string): Promise<{
  eligible: boolean;
  rank: number;
  gradeLabel: string;
  pilotProfileId: string | null;
}> {
  const profile = await prisma.pilotProfile.findFirst({
    where: { userId },
    select: {
      id: true,
      subscriptions: {
        where: { status: "active" },
        take: 1,
        select: { subscriptionPlan: { select: { code: true, name: true } } },
      },
    },
  });

  const plan = profile?.subscriptions[0]?.subscriptionPlan;
  const rank = membershipTierRank(plan?.code);
  return {
    eligible: rank >= 4,
    rank,
    gradeLabel: plan?.name ?? "A-1 Student",
    pilotProfileId: profile?.id ?? null,
  };
}

function toPilotBallot(ballot: SquadronBallotDto): SquadronBallotDto {
  return {
    ...ballot,
    evidenceHref: `/dashboard/pilot/squadron-voting?ballot=${ballot.id}`,
  };
}

export async function getPilotSquadronVotingDashboard(
  userId: string,
): Promise<PilotSquadronVotingDashboard> {
  const [grade, dashboard, partyDisputeIds] = await Promise.all([
    getPilotSquadronGrade(userId),
    getSquadronVotingDashboard(userId),
    listPartyDisputeIdsForUser(userId),
  ]);

  const ballots = dashboard.ballots.map(toPilotBallot);
  const isPartyOnOpenBallot = ballots.some(
    (ballot) =>
      ballot.status === "open" && partyDisputeIds.has(ballot.disputeId),
  );

  return {
    ballots,
    metrics: dashboard.metrics,
    eligible: grade.eligible,
    gradeLabel: grade.gradeLabel,
    isPartyOnOpenBallot,
  };
}

async function listPartyDisputeIdsForUser(userId: string): Promise<Set<string>> {
  const rows = await prisma.dispute.findMany({
    where: {
      OR: [
        { booking: { clientProfile: { userId } } },
        { booking: { pilotProfile: { userId } } },
      ],
    },
    select: { id: true },
  });
  return new Set(rows.map((row) => row.id));
}

export async function castPilotSquadronVote(
  userId: string,
  ballotId: string,
  vote: SquadronVote["vote"],
  comment?: string,
): Promise<
  { ok: true; ballot: SquadronBallotDto } | { ok: false; error: string; status?: number }
> {
  const grade = await getPilotSquadronGrade(userId);
  if (!grade.eligible) {
    return {
      ok: false,
      error: "Squadron voting requires grade A-4 or higher.",
      status: 403,
    };
  }

  const result = await castSquadronVote(ballotId, userId, vote, comment);
  if (!result.ok) return result;
  return { ok: true, ballot: toPilotBallot(result.ballot) };
}

export async function getPilotSquadronEvidence(
  userId: string,
  ballotId: string,
): Promise<
  | { ok: true; evidence: PilotSquadronEvidence }
  | { ok: false; error: string; status: number }
> {
  const grade = await getPilotSquadronGrade(userId);
  if (!grade.eligible) {
    return {
      ok: false,
      error: "Squadron voting requires grade A-4 or higher.",
      status: 403,
    };
  }

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
          entries: {
            where: { entryType: { in: ["evidence", "comment"] } },
            orderBy: { createdAt: "asc" },
            take: 40,
            include: {
              authorUser: { select: { role: true, email: true } },
            },
          },
        },
      },
    },
  });

  if (!ballot) {
    return { ok: false, error: "Ballot not found.", status: 404 };
  }

  const clientName =
    ballot.dispute.booking.clientProfile.companyName ??
    ballot.dispute.booking.clientProfile.contactName;
  const pilotName = ballot.dispute.booking.pilotProfile.displayName;

  const entries: PilotSquadronEvidenceEntry[] = ballot.dispute.entries.map(
    (entry) => {
      const role = entry.authorUser.role;
      let authorLabel = "Participant";
      if (role === "admin" || role === "super_admin" || role === "moderator") {
        authorLabel = "Moderator";
      } else if (entry.authorUserId === ballot.dispute.booking.clientProfile.userId) {
        authorLabel = "Client";
      } else if (entry.authorUserId === ballot.dispute.booking.pilotProfile.userId) {
        authorLabel = "Pilot";
      }
      return {
        id: entry.id,
        body: entry.body,
        createdAt: entry.createdAt.toISOString(),
        authorLabel,
      };
    },
  );

  return {
    ok: true,
    evidence: {
      ballotId: ballot.id,
      missionTitle: ballot.dispute.booking.job.title,
      reason: ballot.dispute.reason,
      clientName,
      pilotName,
      entries,
    },
  };
}
