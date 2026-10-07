"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Confirming your email…");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error ?? "Could not verify email.");
          return;
        }
        setStatus("ok");
        setMessage(data.message ?? "Email confirmed.");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Could not verify email.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="ras-auth-card text-center">
      <p className="ras-panel-title">Email confirmation</p>
      <h1 className="ras-panel-heading mt-2">
        {status === "ok"
          ? "Email confirmed"
          : status === "error"
            ? "Verification issue"
            : "Confirming…"}
      </h1>
      <p className="ras-help mt-3">{message}</p>
      <div className="mt-6 flex flex-col items-center gap-3">
        {status === "ok" ? (
          <Button type="button" onClick={() => router.push("/login")}>
            Continue to log in
          </Button>
        ) : null}
        {status === "error" ? (
          <Link href="/register" className="ras-link text-sm">
            Back to register
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="ras-auth-card text-center ras-muted text-sm">
          Loading…
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
