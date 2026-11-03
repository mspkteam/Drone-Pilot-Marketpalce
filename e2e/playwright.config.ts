import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.join(__dirname, ".env") });
loadEnv({ path: path.join(__dirname, "..", ".env") });

const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";
const HEADED =
  process.env.HEADED === "1" ||
  process.env.HEADED === "true" ||
  process.argv.includes("--headed");
const SLOW_MO_MS = Number(
  process.env.E2E_SLOW_MO_MS ?? (HEADED ? "350" : "0"),
);
const WORKERS = Number(
  process.env.E2E_WORKERS ?? (HEADED ? "1" : process.env.CI ? "2" : "3"),
);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: !HEADED,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : HEADED ? 0 : 1,
  workers: Number.isFinite(WORKERS) ? WORKERS : 1,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["json", { outputFile: "artifacts/results.json" }],
  ],
  use: {
    baseURL,
    headless: !HEADED,
    launchOptions: {
      slowMo: Number.isFinite(SLOW_MO_MS) ? SLOW_MO_MS : 0,
      // Separate visible Chromium window when headed
      args: HEADED ? ["--window-size=1440,900"] : undefined,
    },
    viewport: { width: 1440, height: 900 },
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: HEADED ? "on" : "retain-on-failure",
    actionTimeout: 25_000,
    navigationTimeout: 60_000,
    ignoreHTTPSErrors: true,
  },
  outputDir: "test-results",
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
});
