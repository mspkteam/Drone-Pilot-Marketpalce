/** Local SQLite file — default while prisma/schema.prisma uses provider sqlite. */
export const LOCAL_SQLITE_URL = "file:./prisma/dev.db";

/**
 * Whether the app and Prisma CLI should use local SQLite.
 * Defaults to local in development even if Neon URLs remain in `.env`.
 */
export function useLocalSqlite(): boolean {
  if (process.env.USE_NEON?.trim() === "1") return false;
  if (process.env.USE_LOCAL_DB?.trim() === "0") return false;
  if (process.env.USE_LOCAL_DB?.trim() === "1") return true;

  const url = process.env.DATABASE_URL?.trim();
  if (url?.startsWith("file:")) return true;

  // SQLite schema — ignore stale Neon URLs until USE_NEON=1 + postgresql provider
  if (process.env.NODE_ENV !== "production") return true;

  return false;
}

export function resolveSqliteUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  return url?.startsWith("file:") ? url : LOCAL_SQLITE_URL;
}
