"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const confirmed = searchParams.get("confirmed");
  const errorParam = searchParams.get("error");
  const [status, setStatus] = useState<"loading" | "ok" | "error">(() => {
    if (confirmed === "1") return "ok";
    if (errorParam) return "error";
    return "loading";
  });
  const [message, setMessage] = useState(() => {
    if (confirmed === "1") {
      return "Email confirmed. You can log in and continue your profile.";
    }
    if (errorParam) return errorParam;
    return "Confirming your email…";
  });
  const started = useRef(false);

  useEffect(() => {
    if (confirmed === "1" || errorParam) return;
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    // Guard React Strict Mode / remount double-POST.
    if (started.current) return;
    started.current = true;

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
  }, [token, confirmed, errorParam]);

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
          <>
            <Link href="/login" className="ras-link text-sm">
              Go to log in
            </Link>
            <Link href="/register" className="ras-link text-sm">
              Back to register
            </Link>
          </>
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
