import { handlers } from "@/auth";

/** Prisma + Neon require Node.js (not Edge). */
export const runtime = "nodejs";
/** Avoid stale static optimization of Auth.js session endpoints in dev. */
export const dynamic = "force-dynamic";

export const { GET, POST } = handlers;
