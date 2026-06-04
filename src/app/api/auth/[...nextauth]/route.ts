import { handlers } from "@/auth";

/** Prisma + Neon require Node.js (not Edge). */
export const runtime = "nodejs";

export const { GET, POST } = handlers;
