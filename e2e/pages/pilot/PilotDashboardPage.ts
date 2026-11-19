import type { Page } from "@playwright/test";
import path from "node:path";

export class PilotDashboardPage {
  constructor(readonly page: Page) {}

  async gotoHome() {
    await this.page.goto("/dashboard/pilot");
  }

  async gotoProfile() {
    await this.page.goto("/dashboard/pilot/profile");
  }

  async gotoJobs() {
    await this.page.goto("/dashboard/pilot/jobs");
  }

  async gotoLockedJobs() {
    await this.page.goto("/dashboard/pilot/locked-jobs");
  }

  async gotoVerifications() {
    await this.page.goto("/dashboard/pilot/verifications");
  }

  async gotoSubscription() {
    await this.page.goto("/dashboard/pilot/subscription");
  }

  async gotoApplications() {
    await this.page.goto("/dashboard/pilot/applications");
  }

  async gotoSettings() {
    await this.page.goto("/dashboard/pilot/settings");
  }

  async closeOverlayIfOpen() {
    const close = this.page.getByRole("button", {
      name: /Close add payload|Close|Cancel/i,
    });
    if (await close.count()) {
      await close.first().click().catch(() => undefined);
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Completes pilot profile onboarding on PilotProfileCompletionView.
   * New pilots use "Submit for review" (not "Save Profile").
   */
  async completeOnboarding(displayName: string) {
    await this.gotoProfile();
    await this.closeOverlayIfOpen();

    await this.page.locator("#displayName").waitFor({ state: "visible" });
    await this.page.locator("#displayName").fill(displayName);

    const location = this.page.locator("#location");
    if (await location.count()) {
      await location.fill("Karachi, Pakistan");
    }

    // Exact service category chips from the UI
    const aerial = this.page.getByRole("button", { name: /^Aerial Video$/i });
    if (await aerial.count()) {
      await aerial.click();
    } else {
      await this.page.getByRole("button", { name: /^Photography$/i }).click();
    }

    // Compliance checkboxes in LICENSE & COMPLIANCE
    const boxes = this.page.locator(
      'input[type="checkbox"][name], .profile-onboarding-compliance input[type="checkbox"], input[type="checkbox"]',
    );
    const count = await boxes.count();
    for (let i = 0; i < count; i++) {
      const box = boxes.nth(i);
      // Skip non-compliance boxes if any; checking all is OK for onboarding
      if (!(await box.isChecked())) {
        await box.check({ force: true });
      }
    }

    await this.closeOverlayIfOpen();

    const submitReview = this.page.getByRole("button", {
      name: /Submit for review|Resubmit for review|Save Profile/i,
    });
    await submitReview.click();

    await this.page
      .getByRole("status")
      .or(
        this.page.locator(
          "text=/profile saved|submitted|review|successfully|complete/i",
        ),
      )
      .first()
      .waitFor({ state: "visible", timeout: 45000 })
      .catch(() => undefined);
  }

  async tryUploadVerification() {
    await this.gotoVerifications();
    const fileInput = this.page.locator('input[type="file"]').first();
    if (await fileInput.count()) {
      const pdf = path.join(__dirname, "../../fixtures/files/valid-license.pdf");
      await fileInput.setInputFiles(pdf);
      const submit = this.page.getByRole("button", {
        name: /Submit|Upload|Save|Add/i,
      });
      if (await submit.count()) await submit.first().click();
      await this.page.waitForTimeout(1000);
    }
  }

  async exploreNav() {
    for (const p of [
      "/dashboard/pilot",
      "/dashboard/pilot/jobs",
      "/dashboard/pilot/locked-jobs",
      "/dashboard/pilot/applications",
      "/dashboard/pilot/bookings",
      "/dashboard/pilot/messages",
      "/dashboard/pilot/subscription",
      "/dashboard/pilot/verifications",
      "/dashboard/pilot/certificates",
      "/dashboard/pilot/shop",
      "/dashboard/pilot/support",
      "/dashboard/pilot/settings",
    ]) {
      await this.page.goto(p);
      await this.page.waitForTimeout(600);
    }
  }
}
