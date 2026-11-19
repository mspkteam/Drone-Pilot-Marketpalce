import type { Page } from "@playwright/test";

/** Full Client Post Project wizard (5 steps + terms modal). */
export class JobWizardPage {
  constructor(readonly page: Page) {}

  async gotoNew() {
    await this.page.goto("/dashboard/client/jobs/new");
    await this.page.waitForURL(/\/jobs\/new/);
  }

  async selectService(label = "Aerial Photography") {
    await this.page.getByRole("radio", { name: new RegExp(label, "i") }).click();
  }

  async continue() {
    await this.page.getByRole("button", { name: /^Continue/i }).click();
  }

  async fillLocation(opts: {
    address: string;
    city: string;
    country: string;
    state: string;
  }) {
    await this.page.getByLabel(/Project Address/i).fill(opts.address);
    await this.page.getByLabel(/^City$/i).fill(opts.city);
    await this.page.getByLabel(/^Country$/i).fill(opts.country);
    await this.page.getByLabel(/^State$/i).fill(opts.state);
  }

  async fillRequirements(opts?: { notes?: string; deliverable?: string }) {
    const deliverable = opts?.deliverable ?? "Photos";
    const chip = this.page.getByRole("button", { name: new RegExp(deliverable, "i") }).first();
    if (await chip.count()) await chip.click();
    const notes = this.page.getByLabel(/special requirements/i).or(
      this.page.locator("textarea").first(),
    );
    if (await notes.count()) {
      await notes
        .first()
        .fill(
          opts?.notes ??
            "E2E QA project notes: clear weather preferred, deliver edited stills.",
        );
    }
  }

  async fillBudget(opts?: {
    min?: string;
    max?: string;
    quoteType?: string;
    priority?: string;
  }) {
    const quote = opts?.quoteType ?? "Receive Pilot Proposals";
    await this.page
      .getByRole("button", { name: new RegExp(quote, "i") })
      .first()
      .click();

    const min = this.page.getByLabel(/Minimum Budget/i);
    const max = this.page.getByLabel(/Maximum Budget/i);
    if (await min.count()) await min.fill(opts?.min ?? "1500");
    if (await max.count()) await max.fill(opts?.max ?? "3500");

    // Priority cards include helper text in accessible name
    const priority = opts?.priority ?? "Standard";
    await this.page
      .getByRole("button", { name: new RegExp(`^${priority}`, "i") })
      .first()
      .click();

    // Travel coverage radios (not plain buttons)
    const travelNo = this.page.getByRole("radio", { name: /^No$/i });
    await travelNo.click();

    // Optional dates — fill both deadline + completion if date inputs exist
    const dates = this.page.locator('input[type="date"]');
    const dateCount = await dates.count();
    if (dateCount > 0) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 14);
      const completion = new Date();
      completion.setDate(completion.getDate() + 21);
      await dates.nth(0).fill(deadline.toISOString().slice(0, 10));
      if (dateCount > 1) {
        await dates.nth(1).fill(completion.toISOString().slice(0, 10));
      }
    }
  }

  async submitWithTerms() {
    await this.page.getByRole("button", { name: /Submit Project/i }).click();
    // Terms modal — custom checkbox button + Submit Project
    const dialog = this.page.getByRole("dialog");
    await dialog.waitFor({ state: "visible", timeout: 15000 });
    const ack = dialog
      .getByRole("checkbox")
      .or(dialog.locator("button.client-post-project-terms-checkbox"))
      .or(dialog.getByLabel(/terms|acknowledge|agree/i))
      .first();
    await ack.click();
    await dialog.getByRole("button", { name: /^Submit Project$/i }).click();
    await this.page.waitForURL(/\/dashboard\/client\/jobs/, { timeout: 60000 });
  }

  /** Drive the full wizard end-to-end. */
  async completeAndSubmit() {
    await this.gotoNew();
    await this.selectService("Aerial Photography");
    await this.continue();
    await this.fillLocation({
      address: "100 QA Test Avenue",
      city: "Karachi",
      country: "Pakistan",
      state: "Sindh",
    });
    await this.continue();
    await this.fillRequirements();
    await this.continue();
    await this.fillBudget();
    await this.continue();
    await this.submitWithTerms();
  }
}
