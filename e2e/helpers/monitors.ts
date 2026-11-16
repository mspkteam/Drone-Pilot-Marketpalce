import type { ConsoleMessage, Page, Request, Response } from "@playwright/test";

export type PageMonitor = {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: Array<{ url: string; status?: number; failure?: string }>;
  dispose: () => void;
};

/** Attach console + network failure collectors for a page. */
export function attachMonitors(page: Page): PageMonitor {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: PageMonitor["failedRequests"] = [];

  const onConsole = (msg: ConsoleMessage) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  };
  const onPageError = (err: Error) => {
    pageErrors.push(err.message);
  };
  const onResponse = (res: Response) => {
    const status = res.status();
    if (status >= 500) {
      failedRequests.push({ url: res.url(), status });
    }
  };
  const onRequestFailed = (req: Request) => {
    const failure = req.failure()?.errorText;
    // Ignore aborted navigations / cancelled prefetch noise when possible.
    if (failure && /ERR_ABORTED|NS_BINDING_ABORTED/i.test(failure)) return;
    failedRequests.push({ url: req.url(), failure });
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("response", onResponse);
  page.on("requestfailed", onRequestFailed);

  return {
    consoleErrors,
    pageErrors,
    failedRequests,
    dispose: () => {
      page.off("console", onConsole);
      page.off("pageerror", onPageError);
      page.off("response", onResponse);
      page.off("requestfailed", onRequestFailed);
    },
  };
}

/** Filter known third-party / browser noise from console errors. */
export function meaningfulConsoleErrors(errors: string[]): string[] {
  return errors.filter(
    (e) =>
      !/favicon\.ico|Download the React DevTools|third-party|Failed to load resource: net::ERR_ABORTED/i.test(
        e,
      ),
  );
}
