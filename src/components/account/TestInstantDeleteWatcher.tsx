"use client";

import { signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Testing helper: hard-delete only when BOTH params are present and the email
 * matches the signed-in account:
 *   ?instantDelete=1&deleteUser=exact@email.com
 *
 * Also accepts `delete` as an alias for `deleteUser`.
 */
export function TestInstantDeleteWatcher() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const ranKey = useRef<string | null>(null);

  useEffect(() => {
    const confirm = searchParams.get("instantDelete");
    const deleteUser =
      searchParams.get("deleteUser") ?? searchParams.get("delete");
    if (!confirm || !deleteUser) {
      ranKey.current = null;
      return;
    }

    const attemptKey = `${confirm}|${deleteUser.toLowerCase()}`;
    if (ranKey.current === attemptKey) return;
    ranKey.current = attemptKey;

    void (async () => {
      const stripParams = () => {
        const next = new URLSearchParams(searchParams.toString());
        next.delete("instantDelete");
        next.delete("deleteUser");
        next.delete("delete");
        const qs = next.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname);
      };

      try {
        const res = await fetch("/api/account/test-instant-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirm, deleteUser }),
        });
        const data = (await res.json()) as {
          error?: string;
          deletedEmail?: string;
        };
        if (!res.ok) {
          const message =
            data.error ??
            `Instant delete failed (HTTP ${res.status}). Check ALLOW_TEST_INSTANT_DELETE on the server.`;
          console.error("[test instantDelete]", message);
          window.alert(message);
          ranKey.current = null;
          stripParams();
          return;
        }
        await signOut({
          callbackUrl: `/login?deleted=1&email=${encodeURIComponent(data.deletedEmail ?? deleteUser)}`,
        });
      } catch (error) {
        console.error("[test instantDelete]", error);
        window.alert(
          error instanceof Error
            ? error.message
            : "Instant delete request failed. See console for details.",
        );
        ranKey.current = null;
      }
    })();
  }, [searchParams, pathname, router]);

  return null;
}
