import type { Page } from "@playwright/test";

export class JobWizardPage {
  constructor(readonly page: Page) {}

  async gotoNew() {
    await this.page.goto("/dashboard/client/jobs/new");
  }

  async fillBasics(opts: {
    title: string;
    description: string;
    location: string;
  }) {
    // Prefer exact input names / placeholders — avoid aria-label progress items
    const title = this.page.locator('input[name="title"]').or(
      this.page.getByPlaceholder(/title|project name/i),
    );
    if (await title.count()) {
      await title.first().fill(opts.title);
    }

    const desc = this.page.locator('textarea[name="description"]').or(
      this.page.locator("textarea").first(),
    );
    if (await desc.count()) {
      await desc.first().fill(opts.description);
    }

    const location = this.page.locator('input[name="locationLabel"]').or(
      this.page.getByPlaceholder(/address|location|city/i),
    );
    if (await location.count()) {
      const el = location.first();
      const tag = await el.evaluate((n) => n.tagName.toLowerCase());
      if (tag === "input" || tag === "textarea") {
        await el.fill(opts.location);
      }
    }
  }

  async clickContinue() {
    const btn = this.page.getByRole("button", {
      name: /^(Next|Continue|Save draft|Submit|Post)/i,
    });
    if (await btn.count()) await btn.first().click();
  }
}
