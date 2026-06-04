import { prisma } from "@/lib/db";
import type { UserRole } from "@/types/roles";

export function emailUsernameFromAddress(email: string): string {
  const local = email.split("@")[0]?.trim();
  return local && local.length > 0 ? local : "User";
}

/** Pick first non-empty name from candidates, else email local-part. */
export function pickSupportRequesterName(
  email: string,
  ...candidates: (string | null | undefined)[]
): string {
  for (const value of candidates) {
    const trimmed = value?.trim();
    if (trimmed && trimmed.length >= 2) {
      return trimmed;
    }
  }
  return emailUsernameFromAddress(email);
}

export async function getSupportRequesterDisplayForUser(
  userId: string,
  role: UserRole,
): Promise<{ name: string; email: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      pilotProfile: { select: { displayName: true } },
      clientProfile: {
        select: { contactName: true, companyName: true },
      },
    },
  });

  if (!user) {
    return { name: "User", email: "" };
  }

  const email = user.email;

  if (role === "pilot") {
    return {
      email,
      name: pickSupportRequesterName(
        email,
        user.pilotProfile?.displayName,
      ),
    };
  }

  if (role === "client") {
    return {
      email,
      name: pickSupportRequesterName(
        email,
        user.clientProfile?.contactName,
        user.clientProfile?.companyName,
      ),
    };
  }

  return {
    email,
    name: pickSupportRequesterName(email),
  };
}
