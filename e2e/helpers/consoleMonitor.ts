import type { Page, ConsoleMessage, Response } from "@playwright/test";

export type PageMonitor = {
  consoleErrors: string[];
  failedRequests: string[];
};

export function attachMonitors(page: Page): PageMonitor {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    consoleErrors.push(err.message);
  });
  page.on("response", (response: Response) => {
    const status = response.status();
    if (status >= 500) {
      failedRequests.push(`${status} ${response.request().method()} ${response.url()}`);
    }
  });

  return { consoleErrors, failedRequests };
}

/** Filters noisy third-party / hydration noise for assertions. */
export function meaningfulConsoleErrors(errors: string[]): string[] {
  return errors.filter((e) => {
    if (/Download the React DevTools/i.test(e)) return false;
    if (/favicon/i.test(e)) return false;
    return true;
  });
}
