/**
 * Create fresh Client + Pilot accounts for QA.
 *
 * Usage: npx tsx scripts/create-qa-users.ts
 */
import "dotenv/config";
import { hash } from "bcryptjs";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { enrollPilotInTierCode } from "../src/lib/membership/seed-tiers";
import { assignMemberNumberToUser } from "../src/lib/members/assign-member-number";

const prisma = createPrismaClient();
const PASSWORD = "Demo123!";

const stamp = new Date()
  .toISOString()
  .slice(0, 16)
  .replace(/[-:T]/g, "");

const CLIENT_EMAIL = `qa.client.${stamp}@dronepilot.local`;
const PILOT_EMAIL = `qa.pilot.${stamp}@dronepilot.local`;

async function main() {
  const passwordHash = await hash(PASSWORD, 12);
  const now = new Date();

  const clientUser = await prisma.user.create({
    data: {
      email: CLIENT_EMAIL,
      passwordHash,
      role: "client",
      status: "active",
    },
  });
  await assignMemberNumberToUser(clientUser.id);
  await prisma.clientProfile.create({
    data: {
      userId: clientUser.id,
      companyName: "QA Test Client Co",
      contactName: "QA Client",
      phone: "+1-512-555-0199",
      billingAddress: JSON.stringify({
        line1: "200 Congress Ave",
        city: "Austin",
        region: "TX",
        country: "United States",
        postalCode: "78701",
      }),
      status: "active",
      onboardingCompletedAt: now,
      preferencesJson: JSON.stringify({
        projectTypes: ["Inspection"],
        logoPath: null,
      }),
    },
  });

  const pilotUser = await prisma.user.create({
    data: {
      email: PILOT_EMAIL,
      passwordHash,
      role: "pilot",
      status: "active",
    },
  });
  await assignMemberNumberToUser(pilotUser.id);
  const pilotProfile = await prisma.pilotProfile.create({
    data: {
      userId: pilotUser.id,
      displayName: "QA Test Pilot",
      bio: "Fresh QA pilot account for marketplace testing.",
      locationCity: "Austin",
      locationRegion: "TX",
      locationCountry: "United States",
      serviceRadiusKm: 80,
      servicesOffered: JSON.stringify(["inspection", "aerial_photo"]),
      hourlyRateMin: 150,
      hourlyRateMax: 350,
      licenseNumber: `QA-${stamp}`,
      licenseCountry: "United States",
      status: "approved",
      complianceAcceptedAt: now,
      onboardingCompletedAt: now,
      isPublic: true,
      profileExtrasJson: JSON.stringify({
        callSign: "QAPILOT",
        languages: "English",
        mainDrones: ["DJI Mavic 3 Enterprise"],
        payloads: ["RGB"],
        localChipIds: [],
        avatarUrl: null,
      }),
    },
  });
  // A-3 so they can bid (A-1 cannot submit proposals).
  await enrollPilotInTierCode(prisma, pilotProfile.id, "A3_FLIGHT_OFFICER");

  console.log("\nFresh QA accounts ready:\n");
  console.log(`  Client  ${CLIENT_EMAIL}`);
  console.log(`  Pilot   ${PILOT_EMAIL}`);
  console.log(`  Password for both: ${PASSWORD}`);
  console.log("\nPilot grade: A-3 Flight Officer (can submit proposals).\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
