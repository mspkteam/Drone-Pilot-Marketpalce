import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { appendWaitlistToSheet } from "../src/lib/waitlist/sheets";

const prisma = createPrismaClient();

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const webhook =
    process.env.WAITLIST_MAKE_WEBHOOK_URL?.trim() ||
    process.env.WAITLIST_SHEETS_WEBHOOK_URL?.trim();

  if (!webhook) {
    console.error(
      "Set WAITLIST_MAKE_WEBHOOK_URL (or WAITLIST_SHEETS_WEBHOOK_URL) in .env.",
    );
    process.exit(1);
  }

  const entries = await prisma.waitlistEntry.findMany({
    where: { status: "subscribed" },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${entries.length} subscribed waitlist entries.`);

  if (dryRun) {
    for (const entry of entries) {
      console.log(`[dry-run] ${entry.email} · ${entry.source ?? "—"}`);
    }
    return;
  }

  let synced = 0;
  let failed = 0;

  for (const entry of entries) {
    const result = await appendWaitlistToSheet({
      email: entry.email,
      name: entry.name,
      roleInterest: entry.roleInterest,
      region: entry.region,
      source: entry.source,
      createdAt: entry.createdAt.toISOString(),
    });

    if (result.ok) {
      synced += 1;
      console.log(`✓ ${entry.email}`);
    } else {
      failed += 1;
      console.error(`✗ ${entry.email} — ${result.error ?? "unknown error"}`);
    }

    // Gentle pacing for automation rate limits
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log(`Done. Synced: ${synced}, failed: ${failed}.`);

  if (failed > 0) {
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
