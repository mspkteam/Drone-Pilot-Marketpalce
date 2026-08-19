import type { PrismaClient } from "@/generated/prisma/client";
import { calculateCommission, DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";
import { enrollPilotInTierCode } from "@/lib/membership/seed-tiers";

type SeedJobFields = {
  description: string;
  category: string;
  locationLabel: string;
  locationCity: string;
  locationRegion: string;
  locationCountry: string;
  budgetMin?: number;
  budgetMax?: number;
  requirements?: string;
  status: string;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectionReason?: string;
};

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function daysAgo(days: number): Date {
  return hoursAgo(days * 24);
}

async function ensureMemberNumber(userId: string): Promise<void> {
  const { assignMemberNumberToUser } = await import(
    "@/lib/members/assign-member-number"
  );
  await assignMemberNumberToUser(userId);
}

async function ensureUser(
  prisma: PrismaClient,
  email: string,
  role: string,
  passwordHash: string,
) {
  const record = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role, status: "active" },
    create: {
      email,
      passwordHash,
      role,
      status: "active",
    },
  });
  if ((role === "pilot" || role === "client") && !record.memberNumber) {
    await ensureMemberNumber(record.id);
  }
  return prisma.user.findUniqueOrThrow({ where: { id: record.id } });
}

async function ensureJob(
  prisma: PrismaClient,
  clientProfileId: string,
  title: string,
  data: SeedJobFields,
) {
  const existing = await prisma.job.findFirst({
    where: { clientProfileId, title },
  });
  if (existing) return existing;
  return prisma.job.create({
    data: { clientProfileId, title, ...data },
  });
}

async function ensureApplication(
  prisma: PrismaClient,
  jobId: string,
  pilotProfileId: string,
  data: {
    proposedAmount: number;
    message: string;
    status: string;
    shortlistedAt?: Date | null;
  },
) {
  const existing = await prisma.jobApplication.findUnique({
    where: {
      jobId_pilotProfileId: { jobId, pilotProfileId },
    },
  });
  if (existing) {
    return prisma.jobApplication.update({
      where: { id: existing.id },
      data: {
        proposedAmount: data.proposedAmount,
        message: data.message,
        status: data.status,
        shortlistedAt: data.shortlistedAt ?? existing.shortlistedAt,
      },
    });
  }
  return prisma.jobApplication.create({
    data: {
      jobId,
      pilotProfileId,
      proposedAmount: data.proposedAmount,
      currency: "USD",
      message: data.message,
      status: data.status,
      shortlistedAt: data.shortlistedAt ?? null,
    },
  });
}

async function ensureBooking(
  prisma: PrismaClient,
  input: {
    jobId: string;
    jobApplicationId: string;
    pilotProfileId: string;
    clientProfileId: string;
    agreedAmount: number;
    status: string;
    completedAt?: Date | null;
  },
) {
  const existing = await prisma.booking.findUnique({
    where: { jobId: input.jobId },
  });
  if (existing) {
    return prisma.booking.update({
      where: { id: existing.id },
      data: {
        status: input.status,
        agreedAmount: input.agreedAmount,
        completedAt: input.completedAt ?? existing.completedAt,
      },
    });
  }
  return prisma.booking.create({
    data: {
      jobId: input.jobId,
      jobApplicationId: input.jobApplicationId,
      pilotProfileId: input.pilotProfileId,
      clientProfileId: input.clientProfileId,
      agreedAmount: input.agreedAmount,
      currency: "USD",
      status: input.status,
      completedAt: input.completedAt ?? null,
    },
  });
}

const GRADE_PILOTS = [
  {
    email: "pilot-a1@dronepilot.local",
    displayName: "Demo A-1 Student",
    tierCode: "A1_STUDENT",
    city: "Austin",
    bio: "Student member — can view jobs after 48h, cannot bid.",
    services: ["aerial_video"],
  },
  {
    email: "pilot-a2@dronepilot.local",
    displayName: "Demo A-2 Junior",
    tierCode: "A2_JUNIOR_FLIGHT_OFFICER",
    city: "Dallas",
    bio: "Junior Flight Officer — 36h job delay, can bid.",
    services: ["real_estate", "aerial_video"],
  },
  {
    email: "pilot-a3@dronepilot.local",
    displayName: "Demo A-3 Flight Officer",
    tierCode: "A3_FLIGHT_OFFICER",
    city: "Houston",
    bio: "Flight Officer — 24h visibility, inspection specialist.",
    services: ["inspection", "surveying"],
  },
  {
    email: "pilot-a4@dronepilot.local",
    displayName: "Demo A-4 Instructor",
    tierCode: "A4_SENIOR_FLIGHT_OFFICER",
    city: "San Antonio",
    bio: "Senior Flight Officer with instructor add-on for student codes.",
    services: ["aerial_video", "events"],
    instructor: true,
  },
  {
    email: "pilot-a5@dronepilot.local",
    displayName: "Demo A-5 First Officer",
    tierCode: "A5_FIRST_OFFICER",
    city: "Fort Worth",
    bio: "First Officer — 6h job delay.",
    services: ["surveying", "agriculture"],
  },
  {
    email: "pilot-a6@dronepilot.local",
    displayName: "Demo A-6 Captain Alt",
    tierCode: "A6_CAPTAIN",
    city: "El Paso",
    bio: "Second Captain-grade account for marketplace comparison.",
    services: ["inspection", "aerial_video"],
  },
  {
    email: "pilot-a7@dronepilot.local",
    displayName: "Demo A-7 Senior Captain",
    tierCode: "A7_SENIOR_CAPTAIN",
    city: "Austin",
    bio: "Honorary Senior Captain — invitation-only, A-6 marketplace access.",
    services: ["inspection", "surveying", "aerial_video"],
  },
] as const;

/**
 * Idempotent marketplace graph for local + Vercel demo.
 * Does not delete client-created users or jobs.
 */
export async function seedClientTestMarketplace(
  prisma: PrismaClient,
  passwordHash: string,
): Promise<void> {
  const now = new Date();
  const profilesByEmail = new Map<
    string,
    { userId: string; profileId: string }
  >();

  for (const sample of GRADE_PILOTS) {
    const user = await ensureUser(prisma, sample.email, "pilot", passwordHash);
    const extras = {
      callSign: sample.displayName.replace(/[^A-Z0-9]/gi, "").slice(0, 8).toUpperCase(),
      languages: "English",
      mainDrones: ["DJI Matrice 350 RTK"],
      payloads: ["RGB", "Thermal"],
      localChipIds: [],
      avatarUrl: null,
    };
    const profile = await prisma.pilotProfile.upsert({
      where: { userId: user.id },
      update: {
        displayName: sample.displayName,
        bio: sample.bio,
        locationCity: sample.city,
        locationRegion: "TX",
        locationCountry: "United States",
        servicesOffered: JSON.stringify([...sample.services]),
        status: "approved",
        complianceAcceptedAt: now,
        onboardingCompletedAt: now,
        isPublic: true,
        instructorAddonActive: "instructor" in sample && sample.instructor === true,
      },
      create: {
        userId: user.id,
        displayName: sample.displayName,
        bio: sample.bio,
        locationCity: sample.city,
        locationRegion: "TX",
        locationCountry: "United States",
        serviceRadiusKm: 80,
        servicesOffered: JSON.stringify([...sample.services]),
        licenseNumber: `DEMO-${sample.tierCode}`,
        licenseCountry: "United States",
        status: "approved",
        complianceAcceptedAt: now,
        onboardingCompletedAt: now,
        isPublic: true,
        instructorAddonActive: "instructor" in sample && sample.instructor === true,
        profileExtrasJson: JSON.stringify(extras),
      },
    });
    await enrollPilotInTierCode(prisma, profile.id, sample.tierCode);
    if ("instructor" in sample && sample.instructor) {
      await prisma.pilotProfile.update({
        where: { id: profile.id },
        data: {
          instructorAddonActive: true,
          instructorDiscountCode:
            profile.instructorDiscountCode ?? "INSTRUCTOR-A4DEMO",
        },
      });
    }
    profilesByEmail.set(sample.email, {
      userId: user.id,
      profileId: profile.id,
    });
  }

  const pendingPilotUser = await ensureUser(
    prisma,
    "pending-pilot@dronepilot.local",
    "pilot",
    passwordHash,
  );
  await prisma.pilotProfile.upsert({
    where: { userId: pendingPilotUser.id },
    update: { status: "pending_review", displayName: "Pending Review Pilot" },
    create: {
      userId: pendingPilotUser.id,
      displayName: "Pending Review Pilot",
      bio: "Submitted onboarding — waiting on admin approval.",
      licenseNumber: "DEMO-PENDING",
      licenseCountry: "United States",
      status: "pending_review",
      complianceAcceptedAt: now,
      onboardingCompletedAt: now,
      isPublic: false,
    },
  });

  const secondClientUser = await ensureUser(
    prisma,
    "client-media@dronepilot.local",
    "client",
    passwordHash,
  );
  const secondClient = await prisma.clientProfile.upsert({
    where: { userId: secondClientUser.id },
    update: {
      companyName: "Gulf Coast Media",
      contactName: "Riley Chen",
      status: "active",
      onboardingCompletedAt: now,
    },
    create: {
      userId: secondClientUser.id,
      companyName: "Gulf Coast Media",
      contactName: "Riley Chen",
      phone: "+1-713-555-0144",
      status: "active",
      onboardingCompletedAt: now,
    },
  });

  const primaryClient = await prisma.user.findUnique({
    where: { email: "client@dronepilot.local" },
    include: { clientProfile: true },
  });
  const captainUser = await prisma.user.findUnique({
    where: { email: "pilot@dronepilot.local" },
    include: { pilotProfile: true },
  });
  if (!primaryClient?.clientProfile || !captainUser?.pilotProfile) {
    return;
  }

  const clientId = primaryClient.clientProfile.id;
  const captainId = captainUser.pilotProfile.id;
  const a2 = profilesByEmail.get("pilot-a2@dronepilot.local")!;
  const a3 = profilesByEmail.get("pilot-a3@dronepilot.local")!;
  const a5 = profilesByEmail.get("pilot-a5@dronepilot.local")!;

  await prisma.pilotProfile.update({
    where: { id: captainId },
    data: {
      bio: "Seeded Captain (A-6) for client testing — proposals, contracts, messages, and payouts.",
      isPublic: true,
      portfolioJson: JSON.stringify([
        {
          id: "seed-pf-1",
          type: "PHOTOSET",
          title: "Lake Travis listing stills",
          tags: ["REAL ESTATE", "4K"],
          thumbnailUrl: null,
          createdAt: daysAgo(40).toISOString(),
        },
        {
          id: "seed-pf-2",
          type: "VIDEO",
          title: "Downtown survey flythrough",
          tags: ["SURVEY", "MAPPING"],
          thumbnailUrl: null,
          createdAt: daysAgo(20).toISOString(),
        },
      ]),
    },
  });

  const lakeTravis = await ensureJob(
    prisma,
    clientId,
    "Real estate flyover — Lake Travis",
    {
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
      status: "in_bidding",
      submittedAt: daysAgo(5),
      approvedAt: daysAgo(5),
    },
  );

  await ensureJob(
    prisma,
    clientId,
    "Solar farm inspection — West Texas",
    {
      description:
        "Thermal + RGB inspection of a 40-acre solar array. Approved one hour ago so lower grades stay locked.",
      category: "inspection",
      locationLabel: "Midland, TX",
      locationCity: "Midland",
      locationRegion: "TX",
      locationCountry: "United States",
      budgetMin: 2200,
      budgetMax: 3800,
      requirements: "Orthomosaic + anomaly report.",
      status: "open",
      submittedAt: hoursAgo(2),
      approvedAt: hoursAgo(1),
    },
  );

  const visibleToAll = await ensureJob(
    prisma,
    clientId,
    "Event coverage — ACL Festival",
    {
      description: "Two-day festival aerials. Approved more than 48 hours ago so every grade can see it.",
      category: "events",
      locationLabel: "Zilker Park, Austin, TX",
      locationCity: "Austin",
      locationRegion: "TX",
      locationCountry: "United States",
      budgetMin: 1500,
      budgetMax: 2800,
      requirements: "Highlight reel + stills. No overflight of crowds.",
      status: "open",
      submittedAt: hoursAgo(60),
      approvedAt: hoursAgo(55),
    },
  );

  const shortlistJob = await ensureJob(
    prisma,
    clientId,
    "Rooftop inspection — Domain",
    {
      description: "Commercial rooftop + facade inspection. Multiple bids; Captain is shortlisted.",
      category: "inspection",
      locationLabel: "The Domain, Austin, TX",
      locationCity: "Austin",
      locationRegion: "TX",
      locationCountry: "United States",
      budgetMin: 900,
      budgetMax: 1400,
      requirements: "PDF report + annotated stills.",
      status: "in_bidding",
      submittedAt: daysAgo(4),
      approvedAt: daysAgo(4),
    },
  );

  const activeJob = await ensureJob(
    prisma,
    clientId,
    "Ranch mapping — Hill Country",
    {
      description: "2,000-acre ranch orthomosaic. Contract in progress.",
      category: "surveying",
      locationLabel: "Fredericksburg, TX",
      locationCity: "Fredericksburg",
      locationRegion: "TX",
      locationCountry: "United States",
      budgetMin: 3200,
      budgetMax: 4800,
      requirements: "GeoTIFF + KMZ.",
      status: "assigned",
      submittedAt: daysAgo(12),
      approvedAt: daysAgo(11),
    },
  );

  const completedJob = await ensureJob(
    prisma,
    clientId,
    "Marina flyover — Corpus Christi",
    {
      description: "Completed marina marketing package with reviews and payout.",
      category: "aerial_video",
      locationLabel: "Corpus Christi, TX",
      locationCity: "Corpus Christi",
      locationRegion: "TX",
      locationCountry: "United States",
      budgetMin: 700,
      budgetMax: 1100,
      requirements: "Edited 90s reel.",
      status: "closed",
      submittedAt: daysAgo(40),
      approvedAt: daysAgo(39),
    },
  );

  const disputeJob = await ensureJob(
    prisma,
    clientId,
    "Bridge survey — I-35",
    {
      description: "Assigned survey with an open dispute for admin review.",
      category: "surveying",
      locationLabel: "Austin, TX",
      locationCity: "Austin",
      locationRegion: "TX",
      locationCountry: "United States",
      budgetMin: 1800,
      budgetMax: 2500,
      requirements: "Close-range stills of deck joints.",
      status: "assigned",
      submittedAt: daysAgo(18),
      approvedAt: daysAgo(17),
    },
  );

  await ensureJob(prisma, clientId, "Draft wedding aerials — Barton Springs", {
    description: "Client draft — not submitted for approval yet.",
    category: "events",
    locationLabel: "Barton Springs, Austin, TX",
    locationCity: "Austin",
    locationRegion: "TX",
    locationCountry: "United States",
    budgetMin: 500,
    budgetMax: 900,
    status: "draft",
  });

  await ensureJob(prisma, clientId, "Rejected rooftop video — East Austin", {
    description: "Admin rejected this posting so the client can edit and resubmit.",
    category: "aerial_video",
    locationLabel: "East Austin, TX",
    locationCity: "Austin",
    locationRegion: "TX",
    locationCountry: "United States",
    budgetMin: 300,
    budgetMax: 500,
    status: "rejected",
    submittedAt: daysAgo(3),
    rejectionReason: "Missing site access notes and insurance requirements.",
  });

  await ensureJob(prisma, secondClient.id, "Oil pad inspection — Eagle Ford", {
    description: "Second-client job waiting in the admin approval queue.",
    category: "inspection",
    locationLabel: "Karnes City, TX",
    locationCity: "Karnes City",
    locationRegion: "TX",
    locationCountry: "United States",
    budgetMin: 2500,
    budgetMax: 4000,
    status: "pending_approval",
    submittedAt: hoursAgo(6),
  });

  await ensureJob(prisma, secondClient.id, "Coastal real estate — Galveston", {
    description: "Open listing flyover from a second client.",
    category: "real_estate",
    locationLabel: "Galveston, TX",
    locationCity: "Galveston",
    locationRegion: "TX",
    locationCountry: "United States",
    budgetMin: 450,
    budgetMax: 800,
    status: "open",
    submittedAt: daysAgo(3),
    approvedAt: daysAgo(3),
  });

  await ensureApplication(prisma, lakeTravis.id, captainId, {
    proposedAmount: 625,
    message: "Experienced real-estate aerials in Austin. DJI Inspire 3 + dual operator.",
    status: "submitted",
  });
  await ensureApplication(prisma, lakeTravis.id, a3.profileId, {
    proposedAmount: 590,
    message: "Can shoot golden hour tomorrow. Thermal not needed.",
    status: "submitted",
  });
  await ensureApplication(prisma, lakeTravis.id, a2.profileId, {
    proposedAmount: 410,
    message: "Junior rate for stills-only package.",
    status: "rejected",
  });

  await ensureApplication(prisma, shortlistJob.id, captainId, {
    proposedAmount: 1180,
    message: "Full facade + rooftop package with annotated PDF.",
    status: "submitted",
    shortlistedAt: daysAgo(1),
  });
  await ensureApplication(prisma, shortlistJob.id, a5.profileId, {
    proposedAmount: 1050,
    message: "Available mid-week. First Officer grade.",
    status: "submitted",
  });

  await ensureApplication(prisma, visibleToAll.id, captainId, {
    proposedAmount: 2100,
    message: "Withdrawn — schedule conflict with another mission.",
    status: "withdrawn",
  });

  const activeApp = await ensureApplication(prisma, activeJob.id, captainId, {
    proposedAmount: 4100,
    message: "Ranch mapping with RTK and GCPs.",
    status: "accepted",
  });
  const completedApp = await ensureApplication(prisma, completedJob.id, captainId, {
    proposedAmount: 950,
    message: "Marina reel delivered.",
    status: "accepted",
  });
  const disputeApp = await ensureApplication(prisma, disputeJob.id, captainId, {
    proposedAmount: 2100,
    message: "Bridge close-range survey.",
    status: "accepted",
  });

  if (lakeTravis.status !== "in_bidding") {
    await prisma.job.update({
      where: { id: lakeTravis.id },
      data: { status: "in_bidding" },
    });
  }

  const activeBooking = await ensureBooking(prisma, {
    jobId: activeJob.id,
    jobApplicationId: activeApp.id,
    pilotProfileId: captainId,
    clientProfileId: clientId,
    agreedAmount: 4100,
    status: "in_progress",
  });

  const completedBooking = await ensureBooking(prisma, {
    jobId: completedJob.id,
    jobApplicationId: completedApp.id,
    pilotProfileId: captainId,
    clientProfileId: clientId,
    agreedAmount: 950,
    status: "completed",
    completedAt: daysAgo(8),
  });

  const disputeBooking = await ensureBooking(prisma, {
    jobId: disputeJob.id,
    jobApplicationId: disputeApp.id,
    pilotProfileId: captainId,
    clientProfileId: clientId,
    agreedAmount: 2100,
    status: "disputed",
  });

  await prisma.bookingDelivery.upsert({
    where: { bookingId: activeBooking.id },
    update: {
      status: "submitted",
      notes: "Draft orthomosaic uploaded for client review.",
      submittedAt: hoursAgo(8),
    },
    create: {
      bookingId: activeBooking.id,
      status: "submitted",
      notes: "Draft orthomosaic uploaded for client review.",
      filesJson: JSON.stringify([
        {
          id: "seed-del-1",
          kind: "link",
          label: "Preview orthomosaic",
          url: "https://example.com/demo-ranch-ortho",
        },
      ]),
      submittedAt: hoursAgo(8),
    },
  });

  const commission = calculateCommission(950, DEFAULT_COMMISSION_RATE);
  const existingPay = await prisma.payment.findUnique({
    where: { bookingId: completedBooking.id },
  });
  if (!existingPay) {
    const payment = await prisma.payment.create({
      data: {
        bookingId: completedBooking.id,
        payerUserId: primaryClient.id,
        payeeUserId: captainUser.id,
        amountGross: 950,
        amountNet: commission.amountNet,
        currency: "USD",
        provider: "internal",
        status: "succeeded",
      },
    });
    await prisma.commission.create({
      data: {
        bookingId: completedBooking.id,
        paymentId: payment.id,
        rate: DEFAULT_COMMISSION_RATE,
        amount: commission.amount,
        currency: "USD",
        status: "calculated",
      },
    });
  }

  const clientReview = await prisma.review.findUnique({
    where: {
      bookingId_authorUserId: {
        bookingId: completedBooking.id,
        authorUserId: primaryClient.id,
      },
    },
  });
  if (!clientReview) {
    await prisma.review.create({
      data: {
        bookingId: completedBooking.id,
        authorUserId: primaryClient.id,
        targetPilotProfileId: captainId,
        rating: 5,
        comment: "Clean marina reel, on time, easy to work with.",
        status: "published",
      },
    });
  }
  const pilotReview = await prisma.review.findUnique({
    where: {
      bookingId_authorUserId: {
        bookingId: completedBooking.id,
        authorUserId: captainUser.id,
      },
    },
  });
  if (!pilotReview) {
    await prisma.review.create({
      data: {
        bookingId: completedBooking.id,
        authorUserId: captainUser.id,
        targetClientProfileId: clientId,
        rating: 5,
        comment: "Clear brief and fast approval of deliverables.",
        status: "published",
      },
    });
  }

  const existingDispute = await prisma.dispute.findUnique({
    where: { bookingId: disputeBooking.id },
  });
  if (!existingDispute) {
    const dispute = await prisma.dispute.create({
      data: {
        bookingId: disputeBooking.id,
        openedByUserId: primaryClient.id,
        openedByRole: "client",
        status: "open",
        reason: "Delivered stills missed the north span joints specified in the brief.",
      },
    });
    await prisma.disputeEntry.create({
      data: {
        disputeId: dispute.id,
        authorUserId: primaryClient.id,
        entryType: "comment",
        body: "Please re-fly the north span or refund the unused portion.",
      },
    });
  }

  let conversation = await prisma.conversation.findUnique({
    where: { jobApplicationId: activeApp.id },
  });
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        jobId: activeJob.id,
        jobApplicationId: activeApp.id,
        bookingId: activeBooking.id,
        clientProfileId: clientId,
        pilotProfileId: captainId,
        lastMessageAt: hoursAgo(3),
      },
    });
  } else if (!conversation.bookingId) {
    conversation = await prisma.conversation.update({
      where: { id: conversation.id },
      data: { bookingId: activeBooking.id },
    });
  }

  const messageCount = await prisma.message.count({
    where: { conversationId: conversation.id },
  });
  if (messageCount === 0) {
    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          senderUserId: primaryClient.id,
          body: "Can you prioritize the west pasture first? Cattle will move Thursday.",
          createdAt: hoursAgo(10),
        },
        {
          conversationId: conversation.id,
          senderUserId: captainUser.id,
          body: "West pasture is on the plan. Draft ortho is in Deliver Work for your review.",
          createdAt: hoursAgo(3),
        },
      ],
    });
  }

  const unread = await prisma.notification.count({
    where: { userId: captainUser.id, type: "welcome" },
  });
  if (unread === 0) {
    await prisma.notification.create({
      data: {
        userId: captainUser.id,
        type: "welcome",
        title: "Demo data is ready",
        body: "Proposals, contracts, messages, and a locked solar job are seeded for client testing.",
        payload: JSON.stringify({ source: "seed" }),
      },
    });
  }
}
