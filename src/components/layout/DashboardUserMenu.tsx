"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";

function initials(email: string | null | undefined): string {
  if (!email) return "?";
  return email.slice(0, 2).toUpperCase();
}

export function DashboardUserMenu() {
  const { data: session } = useSession();
  const email = session?.user?.email;
  const role = session?.user?.role;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-xs font-medium text-foreground">{email}</p>
        <p className="text-xs capitalize text-muted-foreground">
          {role?.replace("_", " ")}
        </p>
      </div>
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-xs font-semibold text-gold-dark"
        title={email ?? "Account"}
      >
        {initials(email)}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Sign out
      </Button>
    </div>
  );
}
