import { test as base, expect } from "@playwright/test";
import { loginAs, logout } from "../helpers/auth";
import { attachMonitors, type PageMonitor } from "../helpers/monitors";
import type { AccountKey } from "../data/accounts";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { PilotsDirectoryPage } from "../pages/PilotsDirectoryPage";
import { JobsPage } from "../pages/JobsPage";
import { DashboardPage } from "../pages/DashboardPage";

type Fixtures = {
  monitor: PageMonitor;
  homePage: HomePage;
  loginPage: LoginPage;
  pilotsPage: PilotsDirectoryPage;
  jobsPage: JobsPage;
  dashboardPage: DashboardPage;
  asClient: void;
  asPilot: void;
  asAdmin: void;
};

async function authed(
  page: Parameters<typeof loginAs>[0],
  key: AccountKey,
  use: () => Promise<void>,
) {
  await loginAs(page, key);
  await use();
  await logout(page).catch(() => undefined);
}

export const test = base.extend<Fixtures>({
  monitor: async ({ page }, use) => {
    const monitor = attachMonitors(page);
    await use(monitor);
    monitor.dispose();
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  pilotsPage: async ({ page }, use) => {
    await use(new PilotsDirectoryPage(page));
  },
  jobsPage: async ({ page }, use) => {
    await use(new JobsPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  asClient: async ({ page }, use) => {
    await authed(page, "client", use);
  },
  asPilot: async ({ page }, use) => {
    await authed(page, "pilot", use);
  },
  asAdmin: async ({ page }, use) => {
    await authed(page, "admin", use);
  },
});

export { expect };
