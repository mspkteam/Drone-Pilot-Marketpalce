type WaitlistSheetRow = {
  email: string;
  name: string | null;
  roleInterest: string;
  region: string | null;
  source: string | null;
  createdAt: string;
};

/** Optional live Google Sheet sync via Apps Script web app URL. */
export async function appendWaitlistToSheet(row: WaitlistSheetRow): Promise<void> {
  const url = process.env.WAITLIST_SHEETS_WEBHOOK_URL?.trim();
  if (!url) return;

  try {
    // Form-encoded payload survives Google's redirect chain more reliably than raw JSON.
    const body = new URLSearchParams({
      payload: JSON.stringify(row),
    });

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // Non-blocking — DB remains source of truth.
  }
}
