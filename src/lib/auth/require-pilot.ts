import { auth } from "@/auth";
import type { Session } from "next-auth";

export async function requirePilotSession(): Promise<
  | { ok: true; session: Session; userId: string }
  | { ok: false; status: 401 | 403; error: string }
> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, status: 401, error: "Authentication required." };
  }

  if (session.user.role !== "pilot") {
    return { ok: false, status: 403, error: "Pilot access only." };
  }

  return { ok: true, session, userId: session.user.id };
}
