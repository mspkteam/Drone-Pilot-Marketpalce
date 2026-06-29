import { PrismaClient } from "@/generated/prisma/client";
import type { SqlDriverAdapterFactory } from "@prisma/client/runtime/client";
import {
  LOCAL_SQLITE_URL,
  resolveSqliteUrl,
  isLocalSqliteEnabled,
} from "@/lib/local-db";

function requirePostgresUrl(name: "DATABASE_URL" | "DIRECT_URL"): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} is not set. Set USE_NEON=1 and Neon URLs — see docs/NEON_SETUP.md.`,
    );
  }
  if (!value.startsWith("postgresql://") && !value.startsWith("postgres://")) {
    throw new Error(
      `${name} must be a PostgreSQL connection string when USE_NEON=1. Got: ${value.slice(0, 12)}...`,
    );
  }
  return value;
}

function createSqliteClient(connectionString: string): PrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3") as {
    PrismaBetterSqlite3: new (options: { url: string }) => SqlDriverAdapterFactory;
  };
  const adapter = new PrismaBetterSqlite3({ url: connectionString });
  return new PrismaClient({ adapter });
}

function createPostgresClient(connectionString: string): PrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaNeon } = require("@prisma/adapter-neon") as {
    PrismaNeon: new (options: { connectionString: string }) => SqlDriverAdapterFactory;
  };
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

/** Runtime Prisma client — SQLite locally (default in dev), Neon when USE_NEON=1. */
export function createPrismaClient(): PrismaClient {
  if (isLocalSqliteEnabled()) {
    return createSqliteClient(resolveSqliteUrl());
  }

  return createPostgresClient(requirePostgresUrl("DATABASE_URL"));
}

export { LOCAL_SQLITE_URL };
