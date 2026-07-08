import type { WaitlistEntry } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { sendTransactionalEmail } from "@/lib/notifications/email";
import { appendWaitlistToSheet } from "@/lib/waitlist/sheets";
import type {
  WaitlistEntryDto,
  WaitlistRoleInterest,
  WaitlistStatus,
} from "@/types/waitlist";
import {
  WAITLIST_ROLE_INTERESTS,
  WAITLIST_STATUSES,
} from "@/types/waitlist";

export function toWaitlistEntryDto(entry: WaitlistEntry): WaitlistEntryDto {
  return {
    id: entry.id,
    email: entry.email,
    name: entry.name,
    roleInterest: entry.roleInterest as WaitlistRoleInterest,
    region: entry.region,
    source: entry.source,
    status: entry.status as WaitlistStatus,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

export function validateWaitlistInput(body: {
  email?: string;
  name?: string | null;
  roleInterest?: string;
  region?: string | null;
  source?: string | null;
}):
  | {
      ok: true;
      email: string;
      name: string | null;
      roleInterest: WaitlistRoleInterest;
      region: string | null;
      source: string | null;
    }
  | { ok: false; error: string } {
  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "A valid email address is required." };
  }

  const roleInterestRaw = body.roleInterest?.trim();
  const roleInterest = roleInterestRaw || "both";
  if (!WAITLIST_ROLE_INTERESTS.includes(roleInterest as WaitlistRoleInterest)) {
    return { ok: false, error: "Please select how you plan to use the platform." };
  }

  const name = body.name?.trim() || null;
  if (name && name.length > 120) {
    return { ok: false, error: "Name is too long." };
  }

  const region = body.region?.trim() || null;
  if (region && region.length > 120) {
    return { ok: false, error: "Region is too long." };
  }

  const source = body.source?.trim() || null;
  if (source && source.length > 200) {
    return { ok: false, error: "Source value is too long." };
  }

  return {
    ok: true,
    email,
    name,
    roleInterest: roleInterest as WaitlistRoleInterest,
    region,
    source,
  };
}

export async function joinWaitlist(input: {
  email: string;
  name: string | null;
  roleInterest: WaitlistRoleInterest;
  region: string | null;
  source: string | null;
}): Promise<{ ok: true; entry: WaitlistEntryDto; alreadySubscribed: boolean }> {
  const existing = await prisma.waitlistEntry.findUnique({
    where: { email: input.email },
  });

  if (existing?.status === "subscribed") {
    return {
      ok: true,
      entry: toWaitlistEntryDto(existing),
      alreadySubscribed: true,
    };
  }

  const entry = existing
    ? await prisma.waitlistEntry.update({
        where: { id: existing.id },
        data: {
          name: input.name ?? existing.name,
          roleInterest: input.roleInterest,
          region: input.region ?? existing.region,
          source: input.source ?? existing.source,
          status: "subscribed",
        },
      })
    : await prisma.waitlistEntry.create({
        data: {
          email: input.email,
          name: input.name,
          roleInterest: input.roleInterest,
          region: input.region,
          source: input.source,
          status: "subscribed",
        },
      });

  if (!existing || existing.status !== "subscribed") {
    void sendTransactionalEmail({
      to: input.email,
      subject: "You're on the Drone Pilot Marketplace waitlist",
      text: `Thanks for joining! We'll notify you when we expand in your area. Interest: ${input.roleInterest}.`,
    });

    void appendWaitlistToSheet({
      email: entry.email,
      name: entry.name,
      roleInterest: entry.roleInterest,
      region: entry.region,
      source: entry.source,
      createdAt: entry.createdAt.toISOString(),
    });
  }

  return {
    ok: true,
    entry: toWaitlistEntryDto(entry),
    alreadySubscribed: false,
  };
}

export async function listWaitlistForAdmin(
  filter?: WaitlistRoleInterest | "all",
): Promise<WaitlistEntryDto[]> {
  const where =
    filter && filter !== "all"
      ? { status: "subscribed", roleInterest: filter }
      : { status: "subscribed" };

  const entries = await prisma.waitlistEntry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return entries.map(toWaitlistEntryDto);
}

export async function countWaitlistSubscribers() {
  return prisma.waitlistEntry.count({ where: { status: "subscribed" } });
}

export function isValidWaitlistFilter(
  value: string,
): value is WaitlistRoleInterest | "all" {
  return (
    value === "all" ||
    WAITLIST_ROLE_INTERESTS.includes(value as WaitlistRoleInterest)
  );
}

export function isValidWaitlistStatus(value: string): value is WaitlistStatus {
  return WAITLIST_STATUSES.includes(value as WaitlistStatus);
}
