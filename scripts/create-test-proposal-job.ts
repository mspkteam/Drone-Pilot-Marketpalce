import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { serializeJobPostProjectMetadata } from "../src/lib/jobs/post-project-metadata";

const prisma = createPrismaClient();

async function main() {
  const clientUser = await prisma.user.findUnique({
    where: { email: "client@dronepilot.local" },
    include: { clientProfile: true },
  });
  if (!clientUser?.clientProfile) {
    throw new Error("Demo client not found. Run npm run db:seed first.");
  }

  const admin = await prisma.user.findUnique({
    where: { email: "admin@dronepilot.local" },
    select: { id: true },
  });

  const now = new Date();
  const job = await prisma.job.create({
    data: {
      clientProfileId: clientUser.clientProfile.id,
      title: "Aerial Photography mission",
      description:
        "Client posted an aerial photography mission via the project wizard. Capture high-resolution stills and survey data over the site.",
      category: "aerial_video",
      locationLabel: "City, abc",
      locationCity: "City",
      locationRegion: "abc",
      locationCountry: "United States",
      scheduledDate: new Date("2026-08-25T18:00:00.000Z"),
      budgetMin: 100,
      budgetMax: 200,
      currency: "USD",
      requirements: "Offers reviewed after submission.",
      postProjectJson: serializeJobPostProjectMetadata({
        serviceId: "aerial_photography",
        locations: [
          {
            address: "",
            city: "City",
            country: "United States",
            state: "abc",
          },
        ],
        deliverables: ["Photos", "Survey Data"],
        quoteType: "fixed_budget",
        priority: "standard",
        completionDate: "2026-08-27",
        deadline: "2026-08-25",
        referenceFileNames: [],
        specialRequirements: null,
        travel: {
          coverTravelExpenses: true,
          airTravel: null,
          lodging: null,
          incidentals: null,
          groundTransport: null,
        },
      }),
      status: "open",
      submittedAt: now,
      approvedAt: now,
      approvedByUserId: admin?.id ?? null,
    },
  });

  console.log("Created open job:", job.id);
  console.log(
    `Submit proposal: http://localhost:3000/dashboard/pilot/jobs/${job.id}/proposal`,
  );
  console.log("Login: pilot@dronepilot.local / Demo123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
