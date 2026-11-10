/**
 * Ensures a real open squadron ballot exists for QA / Pilot #21 scenarios.
 *
 * Usage: npx tsx scripts/seed-squadron-ballot-scenario.ts
 *
 * Prefers an existing dispute without a ballot. Otherwise creates a minimal
 * job → application → booking → dispute → ballot chain using seed demo accounts.
 *
 * Note: pilot@dronepilot.local is a party on the seeded dispute and cannot vote.
 * Use another A-4+ account (e.g. pilot-a4@ / pilot-a5@) to cast peer votes.
 */
import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";

const prisma = createPrismaClient();

async function main() {
  const existingOpen = await prisma.squadronBallot.findFirst({
    where: { status: "open" },
    select: { id: true, disputeId: true },
  });
  if (existingOpen) {
    console.log(
      "Open ballot already exists:",
      existingOpen.id,
      "dispute",
      existingOpen.disputeId,
    );
    return;
  }

  const disputeWithoutBallot = await prisma.dispute.findFirst({
    where: { squadronBallot: null, status: { in: ["open", "under_review"] } },
    orderBy: { createdAt: "desc" },
  });

  let disputeId = disputeWithoutBallot?.id ?? null;
  const admin = await prisma.user.findFirst({
    where: { email: "admin@dronepilot.local" },
    select: { id: true },
  });

  if (!disputeId) {
    const client = await prisma.clientProfile.findFirst({
      where: { user: { email: "client@dronepilot.local" } },
    });
    const pilot = await prisma.pilotProfile.findFirst({
      where: { user: { email: "pilot@dronepilot.local" } },
    });

    if (!client || !pilot || !admin) {
      throw new Error(
        "Missing seed accounts (client@ / pilot@ / admin@ dronepilot.local).",
      );
    }

    const job = await prisma.job.create({
      data: {
        clientProfileId: client.id,
        title: "QA Squadron Vote Mission",
        description:
          "Seeded mission for squadron peer-moderation ballot scenarios.",
        category: "inspection",
        locationLabel: "Austin, TX",
        locationCity: "Austin",
        locationRegion: "TX",
        locationCountry: "United States",
        status: "assigned",
        currency: "USD",
      },
    });

    const application = await prisma.jobApplication.create({
      data: {
        jobId: job.id,
        pilotProfileId: pilot.id,
        proposedAmount: 1200,
        originalProposedAmount: 1200,
        currency: "USD",
        message: "Seeded proposal for squadron vote QA.",
        status: "accepted",
      },
    });

    const booking = await prisma.booking.create({
      data: {
        jobId: job.id,
        jobApplicationId: application.id,
        clientProfileId: client.id,
        pilotProfileId: pilot.id,
        status: "disputed",
        agreedAmount: 1200,
        currency: "USD",
      },
    });

    const dispute = await prisma.dispute.create({
      data: {
        bookingId: booking.id,
        openedByUserId: client.userId,
        openedByRole: "client",
        reason: "Deliverable quality dispute — squadron vote QA scenario",
        status: "under_review",
        entries: {
          create: [
            {
              authorUserId: client.userId,
              entryType: "evidence",
              body: "Client evidence: delivered photos miss the contracted roof facets and lack metadata stamps.",
            },
            {
              authorUserId: pilot.userId,
              entryType: "evidence",
              body: "Pilot evidence: full capture set uploaded; weather abort was approved in chat before the second pass.",
            },
            {
              authorUserId: admin.id,
              entryType: "comment",
              body: "Escalated to squadron vote for peer review (seeded QA scenario).",
            },
          ],
        },
      },
    });
    disputeId = dispute.id;
    console.log("Created dispute", disputeId);
  }

  const ballot = await prisma.squadronBallot.create({
    data: {
      disputeId,
      status: "open",
      openedByUserId: admin?.id ?? null,
      votesJson: "[]",
    },
  });

  console.log("Opened squadron ballot", ballot.id, "for dispute", disputeId);
  console.log(
    "Vote as an A-4+ peer who is not a party (e.g. pilot-a4@dronepilot.local) at /dashboard/pilot/squadron-voting",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
