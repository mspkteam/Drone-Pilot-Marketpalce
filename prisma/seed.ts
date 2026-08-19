import "dotenv/config";
import { hash } from "bcryptjs";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { issueCertificateToPilot } from "../src/lib/certificates/certificate";
import {
  ensureDefaultWingDefinitions,
  evaluateAndAssignWings,
} from "../src/lib/wings/wings";
import { seedUniformCatalog } from "../src/lib/shop/shop";
import {
  enrollPilotInTierCode,
  seedMembershipTiers,
} from "../src/lib/membership/seed-tiers";
import { buildPresetPermissions } from "../src/lib/auth/moderator-permissions";
import { seedCmsContent } from "../src/lib/cms/cms-repository";
import { CANONICAL_CERTIFICATE_TEMPLATES } from "../src/lib/admin/certificate-display";
import { seedClientTestMarketplace } from "../src/lib/demo/seed-client-test-data";

const prisma = createPrismaClient();

const SEED_PASSWORD = "Demo123!";

const users = [
  { email: "admin@dronepilot.local", role: "super_admin" },
  { email: "ops@dronepilot.local", role: "admin" },
  { email: "moderator@dronepilot.local", role: "moderator" },
  { email: "pilot@dronepilot.local", role: "pilot" },
  { email: "client@dronepilot.local", role: "client" },
];

async function main() {
  const passwordHash = await hash(SEED_PASSWORD, 12);

  await seedMembershipTiers(prisma);

  for (const user of users) {
    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: { passwordHash, role: user.role, status: "active" },
      create: {
        email: user.email,
        passwordHash,
        role: user.role,
        status: "active",
      },
    });

    if (
      (user.role === "pilot" || user.role === "client") &&
      !record.memberNumber
    ) {
      const { assignMemberNumberToUser } = await import(
        "@/lib/members/assign-member-number"
      );
      await assignMemberNumberToUser(record.id);
    }
    if (user.role === "moderator" || user.role === "admin") {
      // Demo staff + new records get full operational access.
      // "limited" is only kept when a Super Admin already set it on a non-demo account.
      const existingPerm = await prisma.moderatorPermissionRecord.findUnique({
        where: { userId: record.id },
      });
      const demoStaffEmails = new Set([
        "moderator@dronepilot.local",
        "ops@dronepilot.local",
      ]);
      const forceFull =
        demoStaffEmails.has(user.email) ||
        !existingPerm ||
        existingPerm.preset === "full";
      const preset = forceFull
        ? "full"
        : (existingPerm.preset as "full" | "limited" | "custom");
      const permissionsJson =
        preset === "custom" && existingPerm
          ? existingPerm.permissionsJson
          : JSON.stringify(buildPresetPermissions(preset));

      await prisma.moderatorPermissionRecord.upsert({
        where: { userId: record.id },
        create: {
          userId: record.id,
          preset: "full",
          permissionsJson: JSON.stringify(buildPresetPermissions("full")),
        },
        update: {
          preset,
          permissionsJson,
        },
      });
    }

    if (user.role === "client") {
      const now = new Date();
      const clientProfile = await prisma.clientProfile.upsert({
        where: { userId: record.id },
        update: {},
        create: {
          userId: record.id,
          companyName: "Demo Productions LLC",
          contactName: "Demo Client",
          phone: "+1-512-555-0100",
          billingAddress: JSON.stringify({
            line1: "100 Congress Ave",
            city: "Austin",
            region: "TX",
            country: "United States",
            postalCode: "78701",
          }),
          status: "active",
          onboardingCompletedAt: now,
        },
      });

      const pendingCount = await prisma.job.count({
        where: {
          clientProfileId: clientProfile.id,
          status: "pending_approval",
        },
      });
      if (pendingCount === 0) {
        await prisma.job.create({
          data: {
            clientProfileId: clientProfile.id,
            title: "Aerial survey — downtown Austin",
            description:
              "Need aerial mapping and 4K video of a 2-acre commercial site before ground breaking. FAA-compliant ops required.",
            category: "surveying",
            locationLabel: "Congress Ave & 2nd St, Austin, TX",
            locationCity: "Austin",
            locationRegion: "TX",
            locationCountry: "United States",
            budgetMin: 800,
            budgetMax: 1500,
            requirements: "Deliver orthomosaic + MP4. 48h turnaround.",
            status: "pending_approval",
            submittedAt: now,
          },
        });
      }

      const openCount = await prisma.job.count({
        where: {
          clientProfileId: clientProfile.id,
          status: "open",
        },
      });
      if (openCount === 0) {
        await prisma.job.create({
          data: {
            clientProfileId: clientProfile.id,
            title: "Real estate flyover — Lake Travis",
            description:
              "4K aerial video and stills for a luxury listing. Golden-hour preferred; 2-hour on-site window.",
            category: "real_estate",
            locationLabel: "Lake Travis, TX",
            locationCity: "Austin",
            locationRegion: "TX",
            locationCountry: "United States",
            budgetMin: 400,
            budgetMax: 750,
            requirements: "Deliver edited MP4 + 10 RAW stills within 72h.",
            status: "open",
            submittedAt: now,
            approvedAt: now,
          },
        });
      }
    }

    if (user.role === "pilot") {
      const now = new Date();
      await prisma.pilotProfile.upsert({
        where: { userId: record.id },
        update: {
          status: "approved",
          complianceAcceptedAt: now,
          onboardingCompletedAt: now,
          isPublic: true,
        },
        create: {
          userId: record.id,
          displayName: "Demo Pilot (Captain)",
          bio: "Seeded pilot profile for local development.",
          locationCity: "Austin",
          locationRegion: "TX",
          locationCountry: "United States",
          serviceRadiusKm: 80,
          servicesOffered: JSON.stringify([
            "aerial_video",
            "real_estate",
            "inspection",
          ]),
          licenseNumber: "DEMO-PILOT-001",
          licenseCountry: "United States",
          status: "approved",
          complianceAcceptedAt: now,
          onboardingCompletedAt: now,
          isPublic: true,
        },
      });
    }
  }

  const pilotUser = await prisma.user.findUnique({
    where: { email: "pilot@dronepilot.local" },
    include: { pilotProfile: true },
  });

  if (pilotUser?.pilotProfile) {
    await enrollPilotInTierCode(
      prisma,
      pilotUser.pilotProfile.id,
      "A6_CAPTAIN",
    );

    const pendingVerification = await prisma.verification.findFirst({
      where: {
        pilotProfileId: pilotUser.pilotProfile.id,
        type: "insurance",
        status: "pending",
      },
    });
    if (!pendingVerification) {
      await prisma.verification.create({
        data: {
          pilotProfileId: pilotUser.pilotProfile.id,
          type: "insurance",
          documentUrl: "https://example.com/demo-pilot-insurance-cert",
          notes: "Demo insurance certificate for admin verification queue.",
          status: "pending",
        },
      });
    }

    const approvedLicense = await prisma.verification.findFirst({
      where: {
        pilotProfileId: pilotUser.pilotProfile.id,
        type: "license",
        status: "approved",
      },
    });
    if (!approvedLicense) {
      const now = new Date();
      await prisma.verification.create({
        data: {
          pilotProfileId: pilotUser.pilotProfile.id,
          type: "license",
          documentUrl: "https://example.com/demo-pilot-license",
          notes: "Seeded approved license verification.",
          status: "approved",
          reviewedAt: now,
        },
      });
    }
  }

  await seedClientTestMarketplace(prisma, passwordHash);

  const waitlistSeeds = [
    {
      email: "waitlist-pilot@example.com",
      name: "Alex Rivera",
      roleInterest: "pilot",
      region: "Denver, CO",
      source: "seed",
    },
    {
      email: "waitlist-client@example.com",
      name: "Jordan Lee",
      roleInterest: "client",
      region: "Seattle, WA",
      source: "seed",
    },
  ];

  for (const entry of waitlistSeeds) {
    await prisma.waitlistEntry.upsert({
      where: { email: entry.email },
      update: {
        name: entry.name,
        roleInterest: entry.roleInterest,
        region: entry.region,
        source: entry.source,
        status: "subscribed",
      },
      create: {
        email: entry.email,
        name: entry.name,
        roleInterest: entry.roleInterest,
        region: entry.region,
        source: entry.source,
        status: "subscribed",
      },
    });
  }

  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@dronepilot.local" },
  });
  const demoPilot = await prisma.pilotProfile.findFirst({
    where: { user: { email: "pilot@dronepilot.local" } },
  });

  await ensureDefaultWingDefinitions();
  await seedUniformCatalog();

  // Canonical Remote Air Service certificate templates (client PNG artwork).
  for (const canon of CANONICAL_CERTIFICATE_TEMPLATES) {
    await prisma.certificateTemplate.upsert({
      where: { slug: canon.slug },
      update: {
        name: canon.name,
        title: canon.title,
        description: canon.description,
        bodyTemplate: canon.bodyTemplate,
        backgroundImageUrl: canon.backgroundImageUrl,
        layoutKey: canon.layoutKey,
        autoRule: canon.autoRule,
        threshold: canon.threshold ?? null,
        isActive: canon.isActive,
      },
      create: {
        name: canon.name,
        slug: canon.slug,
        description: canon.description,
        title: canon.title,
        bodyTemplate: canon.bodyTemplate,
        backgroundImageUrl: canon.backgroundImageUrl,
        layoutKey: canon.layoutKey,
        autoRule: canon.autoRule,
        threshold: canon.threshold ?? null,
        isActive: canon.isActive,
      },
    });
  }

  // Retire staff-designed / superseded templates so the admin list matches client art.
  await prisma.certificateTemplate.updateMany({
    where: {
      slug: {
        in: [
          "platform-verified-pilot",
          "aviator-wings-senior",
          "aviator-wings-master",
          "aviator-wings-basic-gold",
          "certificate-of-promotion-example",
          "captain-promotion-example",
          "recreational-pilot-wings-example",
          "master-aviator-wings-example",
        ],
      },
    },
    data: { isActive: false },
  });

  if (adminUser && demoPilot) {
    const tpl = await prisma.certificateTemplate.findUnique({
      where: { slug: "recreational-pilot-wings" },
    });

    if (tpl) {
      const existingCert = await prisma.pilotCertificate.findFirst({
        where: { pilotProfileId: demoPilot.id, templateId: tpl.id },
      });

      if (!existingCert) {
        await issueCertificateToPilot(adminUser.id, demoPilot.id, tpl.id, {
          notes: "Seeded demo certificate for local testing.",
        });
      }
    }

    await evaluateAndAssignWings(demoPilot.id);
  }

  await seedCmsContent();

  console.log("Seed complete. Demo password for all accounts:", SEED_PASSWORD);
  console.log(
    "Staff:",
    "admin@dronepilot.local, ops@dronepilot.local, moderator@dronepilot.local",
  );
  console.log(
    "Primary test:",
    "client@dronepilot.local, pilot@dronepilot.local (A-6 Captain)",
  );
  console.log(
    "Grades:",
    "pilot-a1@ … pilot-a7@dronepilot.local, pending-pilot@dronepilot.local",
  );
  console.log("Second client:", "client-media@dronepilot.local");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
