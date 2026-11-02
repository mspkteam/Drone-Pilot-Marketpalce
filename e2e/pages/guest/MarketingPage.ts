import type { Page } from "@playwright/test";

export const PUBLIC_NAV = [
  { name: "For Clients", path: "/for-clients" },
  { name: "For Pilots", path: "/for-pilots" },
  { name: "Pricing", path: "/pricing" },
  { name: "How It Works", path: "/how-it-works" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
] as const;

export class MarketingPage {
  constructor(readonly page: Page) {}

  async gotoHome() {
    await this.page.goto("/");
  }

  async openPath(path: string) {
    await this.page.goto(path);
  }

  async collectInteractiveInventory() {
    const buttons = await this.page.locator("button:visible").allTextContents();
    const links = await this.page.locator("a:visible").evaluateAll((els) =>
      els.map((a) => ({
        text: (a.textContent || "").trim().slice(0, 80),
        href: (a as HTMLAnchorElement).getAttribute("href") || "",
      })),
    );
    const inputs = await this.page.locator("input:visible, textarea:visible, select:visible").evaluateAll((els) =>
      els.map((el) => ({
        tag: el.tagName.toLowerCase(),
        name: el.getAttribute("name") || "",
        id: el.id || "",
        type: el.getAttribute("type") || "",
      })),
    );
    return { buttons, links, inputs };
  }
}
