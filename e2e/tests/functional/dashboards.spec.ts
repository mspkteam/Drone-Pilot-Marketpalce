import { test, expect } from "../../fixtures/test";
import {
  CLIENT_DASHBOARD_PATHS,
  PILOT_DASHBOARD_PATHS,
} from "../../data/accounts";
import { withStep } from "../../helpers/logger";
import { softGoto } from "../../helpers/navigation";

test.describe("Role dashboards @functional", () => {
  test("client dashboard shell and key modules respond", async ({
    page,
    asClient,
  }) => {
    void asClient;
    const failures: string[] = [];
    for (const path of CLIENT_DASHBOARD_PATHS) {
      await withStep(`Client route ${path}`, async () => {
        const result = await softGoto(page, path);
        if (!result.ok) {
          failures.push(`${path}: ${result.detail}`);
          return;
        }
        if (result.url.includes("/login")) {
          failures.push(`${path}: redirected to login`);
        }
      });
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });

  test("pilot dashboard shell and key modules respond", async ({
    page,
    asPilot,
  }) => {
    void asPilot;
    const failures: string[] = [];
    for (const path of PILOT_DASHBOARD_PATHS) {
      await withStep(`Pilot route ${path}`, async () => {
        const result = await softGoto(page, path);
        if (!result.ok) {
          failures.push(`${path}: ${result.detail}`);
          return;
        }
        if (result.url.includes("/login")) {
          failures.push(`${path}: redirected to login`);
        }
      });
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
});
