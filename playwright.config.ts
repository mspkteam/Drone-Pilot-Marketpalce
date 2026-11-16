import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const BASE_URL =
  process.env.BASE_URL?.replace(/\/$/, "") ??
  "https://drone-pilot-marketpalce.vercel.app";

const isCI = !!process.env.CI;

/**
 * Playwright QA audit config for Drone Pilot Marketplace.
 * Default target: live Vercel site via BASE_URL.
 */
export default defineConfig({
  testDir: path.join(__dirname, "e2e/tests"),
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 1,
  workers: process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : isCI ? 2 : 3,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  reporter: [
    ["list", { printSteps: true }],
    ["html", { outputFolder: "reports/html", open: "never" }],
    ["json", { outputFile: "reports/playwright-report.json" }],
  ],
  outputDir: "test-results",
  use: {
    baseURL: BASE_URL,
    headless: process.env.HEADED === "1" ? false : true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 20_000,
    navigationTimeout: 60_000,
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
      },
    },
    // Cross-browser + mobile matrix on smoke suite (keeps full functional/e2e runtime practical)
    {
      name: "firefox",
      testMatch: "**/smoke/**/*.spec.ts",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: "webkit",
      testMatch: "**/smoke/**/*.spec.ts",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "mobile-chrome",
      testMatch: "**/smoke/**/*.spec.ts",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "mobile-safari",
      testMatch: "**/smoke/**/*.spec.ts",
      use: { ...devices["iPhone 13"] },
    },
  ],
  metadata: {
    product: "Drone Pilot Marketplace / Remote Air Service",
    baseURL: BASE_URL,
  },
});
