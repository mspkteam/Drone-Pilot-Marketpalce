import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

function requirePostgresUrl(name: "DATABASE_URL" | "DIRECT_URL"): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} is not set. Add your Neon connection string to .env — see docs/NEON_SETUP.md.`,
    );
  }
  if (!value.startsWith("postgresql://") && !value.startsWith("postgres://")) {
    throw new Error(
      `${name} must be a PostgreSQL connection string (Neon). Got: ${value.slice(0, 12)}...`,
    );
  }
  return value;
}

/** Runtime client — use Neon pooled `DATABASE_URL` (hostname includes `-pooler`). */
export function createPrismaClient(): PrismaClient {
  const connectionString = requirePostgresUrl("DATABASE_URL");
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}
