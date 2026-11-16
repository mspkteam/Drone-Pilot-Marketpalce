type StepStatus = "START" | "PASS" | "FAIL" | "SKIPPED";

function stamp(): string {
  return new Date().toISOString();
}

/** Structured step logging: START / PASS / FAIL / SKIPPED with reasons. */
export function logStep(
  status: StepStatus,
  name: string,
  reason?: string,
): void {
  const suffix = reason ? ` — ${reason}` : "";
  // eslint-disable-next-line no-console
  console.log(`[${stamp()}] [${status}] ${name}${suffix}`);
}

export async function withStep<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> {
  logStep("START", name);
  try {
    const result = await fn();
    logStep("PASS", name);
    return result;
  } catch (err) {
    logStep("FAIL", name, err instanceof Error ? err.message : String(err));
    throw err;
  }
}

export function skipStep(name: string, reason: string): void {
  logStep("SKIPPED", name, reason);
}
