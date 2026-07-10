const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileRequired(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

export function getClientIp(request: Request): string | undefined {
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;

  const forwarded = request.headers.get("x-forwarded-for")?.trim();
  if (!forwarded) return undefined;

  return forwarded.split(",")[0]?.trim() || undefined;
}

type TurnstileVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    return { ok: true };
  }

  const trimmed = token?.trim();
  if (!trimmed) {
    return { ok: false, error: "Please complete the security check." };
  }

  const body = new URLSearchParams({
    secret,
    response: trimmed,
  });
  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      console.error("[turnstile] verify HTTP error:", res.status);
      return { ok: false, error: "Security check failed. Please try again." };
    }

    const data = (await res.json()) as TurnstileVerifyResponse;
    if (!data.success) {
      console.warn("[turnstile] verify rejected:", data["error-codes"]?.join(", "));
      return { ok: false, error: "Security check failed. Please try again." };
    }

    return { ok: true };
  } catch (error) {
    console.error("[turnstile] verify error:", error);
    return { ok: false, error: "Security check failed. Please try again." };
  }
}
