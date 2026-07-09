type WaitlistSheetRow = {
  email: string;
  name: string | null;
  roleInterest: string;
  region: string | null;
  source: string | null;
  createdAt: string;
};

/** Optional live Google Sheet sync via Apps Script web app URL. */
export async function appendWaitlistToSheet(
  row: WaitlistSheetRow,
): Promise<{ ok: boolean; status?: number; error?: string }> {
  const url = process.env.WAITLIST_SHEETS_WEBHOOK_URL?.trim();
  if (!url) {
    const error = "WAITLIST_SHEETS_WEBHOOK_URL is not set";
    console.warn(`[waitlist] ${error} — skipping sheet sync.`);
    return { ok: false, error };
  }

  try {
    // Form-encoded payload survives Google's redirect chain more reliably than raw JSON.
    const body = new URLSearchParams({
      payload: JSON.stringify(row),
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
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
