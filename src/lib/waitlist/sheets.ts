export type WaitlistSheetRow = {
  email: string;
  name: string | null;
  roleInterest: string;
  region: string | null;
  source: string | null;
  createdAt: string;
};

export function resolveWaitlistSheetWebhookUrl(): string | null {
  return (
    process.env.WAITLIST_MAKE_WEBHOOK_URL?.trim() ||
    process.env.WAITLIST_SHEETS_WEBHOOK_URL?.trim() ||
    null
  );
}

/** Make (Integromat) hooks accept JSON; legacy Google Apps Script uses form payload. */
export function isMakeWebhookUrl(url: string): boolean {
  return /(?:^https?:\/\/)?(?:hook\.[a-z0-9-]+\.)?make\.com\b/i.test(url);
}

/** Sync a waitlist row to Google Sheets via Make.com or legacy Apps Script webhook. */
export async function appendWaitlistToSheet(
  row: WaitlistSheetRow,
): Promise<{ ok: boolean; status?: number; error?: string }> {
  const url = resolveWaitlistSheetWebhookUrl();
  if (!url) {
    const error =
      "WAITLIST_MAKE_WEBHOOK_URL (or WAITLIST_SHEETS_WEBHOOK_URL) is not set";
    console.warn(`[waitlist] ${error} — skipping sheet sync.`);
    return { ok: false, error };
  }

  try {
    const useMake = isMakeWebhookUrl(url);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": useMake
          ? "application/json"
          : "application/x-www-form-urlencoded",
      },
      body: useMake
        ? JSON.stringify(row)
        : new URLSearchParams({ payload: JSON.stringify(row) }).toString(),
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      const error = `Sheet webhook failed (${response.status}): ${text.slice(0, 200)}`;
      console.error(`[waitlist] ${error}`);
      return { ok: false, status: response.status, error };
    }

    return { ok: true, status: response.status };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[waitlist] Sheet webhook error:", error);
    return { ok: false, error: message };
  }
}
