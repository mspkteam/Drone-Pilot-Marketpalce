import "dotenv/config";
import { prisma } from "../src/lib/db";
import { seedUniformCatalog } from "../src/lib/shop/shop";

async function main() {
  await seedUniformCatalog();
  console.log("Uniform catalog seeded (Figma shop SKUs).");
}

void main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
