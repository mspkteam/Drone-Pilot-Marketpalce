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

const prisma = createPrismaClient();

const SEED_PASSWORD = "Demo123!";

const users = [
  { email: "admin@dronepilot.local", role: "super_admin" },
  { email: "ops@dronepilot.local", role: "admin" },
  { email: "moderator@dronepilot.local", role: "moderator" },
  { email: "pilot@dronepilot.local", role: "pilot" },
  { email: "client@dronepilot.local", role: "client" },
];

const SAMPLE_TIER_PILOTS = [
  {
    email: "pilot-a1@dronepilot.local",
    displayName: "Demo A-1 Student",
    tierCode: "A1_STUDENT",
  },
  {
    email: "pilot-a2@dronepilot.local",
    displayName: "Demo A-2 Junior",
    tierCode: "A2_JUNIOR_FLIGHT_OFFICER",
  },
] as const;

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

  for (const sample of SAMPLE_TIER_PILOTS) {
    const record = await prisma.user.upsert({
      where: { email: sample.email },
      update: { passwordHash, role: "pilot", status: "active" },
      create: {
        email: sample.email,
        passwordHash,
        role: "pilot",
        status: "active",
      },
    });
    const now = new Date();
    const profile = await prisma.pilotProfile.upsert({
      where: { userId: record.id },
      update: {
        displayName: sample.displayName,
        status: "approved",
        complianceAcceptedAt: now,
        onboardingCompletedAt: now,
      },
      create: {
        userId: record.id,
        displayName: sample.displayName,
        licenseNumber: `DEMO-${sample.tierCode}`,
        licenseCountry: "United States",
        servicesOffered: JSON.stringify(["aerial_video"]),
        status: "approved",
        complianceAcceptedAt: now,
        onboardingCompletedAt: now,
      },
    });
    await enrollPilotInTierCode(prisma, profile.id, sample.tierCode);
  }

  const clientUser = await prisma.user.findUnique({
    where: { email: "client@dronepilot.local" },
    include: { clientProfile: true },
  });
  const pilotUser = await prisma.user.findUnique({
    where: { email: "pilot@dronepilot.local" },
    include: { pilotProfile: true },
  });

  if (clientUser?.clientProfile && pilotUser?.pilotProfile) {
    const openJob = await prisma.job.findFirst({
      where: {
        clientProfileId: clientUser.clientProfile.id,
        status: { in: ["open", "in_bidding"] },
      },
    });

    if (openJob) {
      const existingApp = await prisma.jobApplication.findUnique({
        where: {
          jobId_pilotProfileId: {
            jobId: openJob.id,
            pilotProfileId: pilotUser.pilotProfile.id,
          },
        },
      });

      if (!existingApp) {
        await prisma.jobApplication.create({
          data: {
            jobId: openJob.id,
            pilotProfileId: pilotUser.pilotProfile.id,
            proposedAmount: 625,
            currency: "USD",
            message:
              "Experienced real-estate aerials in Austin area. DJI Inspire 3 + dual operator.",
            status: "submitted",
          },
        });
        if (openJob.status === "open") {
          await prisma.job.update({
            where: { id: openJob.id },
            data: { status: "in_bidding" },
          });
        }
      }
    }
  }

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

  // Canonical Remote Air Service certificate templates (Figma 808:37671).
  for (const canon of CANONICAL_CERTIFICATE_TEMPLATES) {
    await prisma.certificateTemplate.upsert({
      where: { slug: canon.slug },
      update: {
        name: canon.name,
        title: canon.title,
        description: canon.description,
        bodyTemplate: canon.bodyTemplate,
        isActive: true,
      },
      create: {
        name: canon.name,
        slug: canon.slug,
        description: canon.description,
        title: canon.title,
        bodyTemplate: canon.bodyTemplate,
        isActive: true,
      },
    });
  }

  if (adminUser && demoPilot) {
    const tpl = await prisma.certificateTemplate.upsert({
      where: { slug: "platform-verified-pilot" },
      update: { isActive: true },
      create: {
        name: "Platform Verified Pilot",
        slug: "platform-verified-pilot",
        description: "Recognizes pilots verified on the marketplace.",
        title: "Certificate of Platform Verification",
        bodyTemplate:
          "This certifies that {{pilotName}} (License {{licenseNumber}}) has successfully completed platform verification for {{templateName}}.\n\nCertificate: {{certificateNumber}}\nIssued: {{issueDate}}",
        isActive: true,
      },
    });

    const existingCert = await prisma.pilotCertificate.findFirst({
      where: { pilotProfileId: demoPilot.id, templateId: tpl.id },
    });

    if (!existingCert) {
      await issueCertificateToPilot(
        adminUser.id,
        demoPilot.id,
        tpl.id,
        "Seeded demo certificate for local testing.",
      );
    }

    await evaluateAndAssignWings(demoPilot.id);
  }

  await seedCmsContent();

  console.log("Seed complete. Demo password for all accounts:", SEED_PASSWORD);
  console.log("Accounts:", users.map((u) => u.email).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
