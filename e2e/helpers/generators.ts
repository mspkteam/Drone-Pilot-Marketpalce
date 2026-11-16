/** Isolated test data generators — do not collide with seeded demo rows when creating UI drafts. */

export function uniqueSuffix(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function generateJobTitle(prefix = "E2E QA Job"): string {
  return `${prefix} ${uniqueSuffix()}`;
}

export function generateMessageBody(prefix = "E2E QA message"): string {
  return `${prefix} ${uniqueSuffix()} — automated audit, safe to ignore.`;
}

export function generateContactPayload() {
  const id = uniqueSuffix();
  return {
    name: `E2E Tester ${id}`,
    email: `e2e.tester.${id}@example.com`,
    subject: `E2E contact ${id}`,
    message: `Automated Playwright contact submission ${id}. Please ignore.`,
  };
}
