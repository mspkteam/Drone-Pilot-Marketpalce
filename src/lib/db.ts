import { PrismaClient } from "@/generated/prisma/client";
import { createPrismaClient } from "@/lib/create-prisma-client";

/** Bump when Prisma schema changes so dev HMR does not keep an old client. */
const PRISMA_CLIENT_SCHEMA_VERSION = 35;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchemaVersion?: number;
};

/** Stale singleton from before profile models were added (common in dev HMR). */
function isStalePrismaClient(client: PrismaClient): boolean {
  const c = client as PrismaClient & {
    pilotProfile?: unknown;
    clientProfile?: unknown;
    job?: unknown;
    jobApplication?: unknown;
    booking?: unknown;
    review?: unknown;
    subscriptionPlan?: unknown & { code?: unknown };
    pilotSubscription?: unknown;
    payment?: unknown;
    commission?: unknown;
    notification?: unknown;
    verification?: unknown;
    waitlistEntry?: unknown;
    conversation?: unknown;
    message?: unknown;
    certificateTemplate?: unknown;
    pilotCertificate?: unknown;
    dispute?: unknown;
    disputeEntry?: unknown;
    wingDefinition?: unknown;
    pilotWing?: unknown;
    uniformProduct?: unknown;
    uniformProductVariant?: unknown;
    uniformOrder?: unknown;
    uniformOrderItem?: unknown;
    supportChat?: unknown;
    supportChatMessage?: unknown;
    moderatorPermissionRecord?: unknown;
    moderatorPermissionAuditLog?: unknown;
    cmsArticleRecord?: unknown;
    cmsResourceRecord?: unknown;
    platformSetting?: unknown;
    operatingRegion?: unknown;
    squadronBallot?: unknown;
  };
  return (
    typeof c.pilotProfile === "undefined" ||
    typeof c.clientProfile === "undefined" ||
    typeof c.job === "undefined" ||
    typeof c.jobApplication === "undefined" ||
    typeof c.booking === "undefined" ||
    typeof c.review === "undefined" ||
    typeof c.subscriptionPlan === "undefined" ||
    typeof c.pilotSubscription === "undefined" ||
    typeof c.payment === "undefined" ||
    typeof c.commission === "undefined" ||
    typeof c.notification === "undefined" ||
    typeof c.verification === "undefined" ||
    typeof c.waitlistEntry === "undefined" ||
    typeof c.conversation === "undefined" ||
    typeof c.message === "undefined" ||
    typeof c.certificateTemplate === "undefined" ||
    typeof c.pilotCertificate === "undefined" ||
    typeof c.dispute === "undefined" ||
    typeof c.disputeEntry === "undefined" ||
    typeof c.wingDefinition === "undefined" ||
    typeof c.pilotWing === "undefined" ||
    typeof c.uniformProduct === "undefined" ||
    typeof c.uniformProductVariant === "undefined" ||
    typeof c.uniformOrder === "undefined" ||
    typeof c.uniformOrderItem === "undefined" ||
    typeof c.supportChat === "undefined" ||
    typeof c.supportChatMessage === "undefined" ||
    typeof c.moderatorPermissionRecord === "undefined" ||
    typeof c.moderatorPermissionAuditLog === "undefined" ||
    typeof c.cmsArticleRecord === "undefined" ||
    typeof c.cmsResourceRecord === "undefined" ||
    typeof c.platformSetting === "undefined" ||
    typeof c.operatingRegion === "undefined" ||
    typeof c.squadronBallot === "undefined"
  );
}

function resolvePrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (
    cached &&
    globalForPrisma.prismaSchemaVersion === PRISMA_CLIENT_SCHEMA_VERSION &&
    !isStalePrismaClient(cached)
  ) {
    return cached;
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaSchemaVersion = PRISMA_CLIENT_SCHEMA_VERSION;
  }
  return client;
}

/**
 * Lazy Prisma client — avoids requiring DATABASE_URL during `next build` until a query runs.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = resolvePrismaClient();
    const value = Reflect.get(client, prop, client) as unknown;
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
