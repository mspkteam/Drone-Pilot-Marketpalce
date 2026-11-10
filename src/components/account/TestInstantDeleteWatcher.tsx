"use client";

import { signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Testing helper: hard-delete only when BOTH params are present and the email
 * matches the signed-in account:
 *   ?instantDelete=1&deleteUser=exact@email.com
 */
export function TestInstantDeleteWatcher() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    const confirm = searchParams.get("instantDelete");
    const deleteUser = searchParams.get("deleteUser");
    if (!confirm || !deleteUser || ran.current) return;
    ran.current = true;

    void (async () => {
      try {
        const res = await fetch("/api/account/test-instant-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirm, deleteUser }),
        });
        const data = (await res.json()) as { error?: string; deletedEmail?: string };
        if (!res.ok) {
          console.error("[test instantDelete]", data.error ?? res.status);
          const next = new URLSearchParams(searchParams.toString());
          next.delete("instantDelete");
          next.delete("deleteUser");
          const qs = next.toString();
          router.replace(qs ? `${pathname}?${qs}` : pathname);
          return;
        }
        await signOut({
          callbackUrl: `/login?deleted=1&email=${encodeURIComponent(data.deletedEmail ?? deleteUser)}`,
        });
      } catch (error) {
        console.error("[test instantDelete]", error);
        ran.current = false;
      }
    })();
  }, [searchParams, pathname, router]);

  return null;
}
