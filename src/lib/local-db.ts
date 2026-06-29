/** Local SQLite file — default while prisma/schema.prisma uses provider sqlite. */
export const LOCAL_SQLITE_URL = "file:./prisma/dev.db";

/**
 * Whether the app and Prisma CLI should use local SQLite.
 * PostgreSQL URLs (Neon) always use the remote adapter — required when schema provider is postgresql.
 */
export function isLocalSqliteEnabled(): boolean {
  if (process.env.USE_NEON?.trim() === "1") return false;
  if (process.env.USE_LOCAL_DB?.trim() === "0") return false;
  if (process.env.USE_LOCAL_DB?.trim() === "1") return true;

  const url = process.env.DATABASE_URL?.trim();
  if (url?.startsWith("file:")) return true;
  if (
    url?.startsWith("postgresql://") ||
    url?.startsWith("postgres://")
  ) {
    return false;
  }

  return process.env.NODE_ENV !== "production";
}

export function resolveSqliteUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  return url?.startsWith("file:") ? url : LOCAL_SQLITE_URL;
}
