#!/usr/bin/env node
/**
 * Mobile full-page screenshots → mobile-screenshots/ → mobile-screenshots.zip
 *
 * Usage:
 *   npm run screenshots:mobile
 *   SCREENSHOT_BASE_URL=https://example.com npm run screenshots:mobile
 *   SCREENSHOT_INCLUDE_DASHBOARD=false   # public marketing pages only
 *   SCREENSHOT_INCLUDE_ADMIN=true        # also capture admin dashboard (optional)
 */
import { spawn } from "node:child_process";
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import dotenv from "dotenv";
import archiver from "archiver";
import { chromium } from "playwright";

dotenv.config();

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = join(ROOT, "mobile-screenshots");
const ZIP_PATH = join(ROOT, "mobile-screenshots.zip");
const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

const VIEWPORT = { width: 390, height: 844 };
const DEVICE_SCALE_FACTOR = 2;
const NAV_TIMEOUT_MS = 60_000;
const NETWORK_IDLE_MS = 2_000;
const POST_LOAD_DELAY_MS = 600;
const MAX_PAGES = 80;
const CRAWL_MAX_DEPTH = 4;

const DEMO_PASSWORD = process.env.SCREENSHOT_DEMO_PASSWORD || "Demo123!";

/** Static dashboard routes (no dynamic [id] segments). */
const DASHBOARD_ROUTE_SETS = {
  pilot: [
    "/dashboard/pilot",
    "/dashboard/pilot/jobs",
    "/dashboard/pilot/locked-jobs",
    "/dashboard/pilot/proposals",
    "/dashboard/pilot/contracts",
    "/dashboard/pilot/messages",
    "/dashboard/pilot/profile",
    "/dashboard/pilot/verifications",
    "/dashboard/pilot/portfolio",
    "/dashboard/pilot/reviews",
    "/dashboard/pilot/payments",
    "/dashboard/pilot/subscription",
    "/dashboard/pilot/shop",
    "/dashboard/pilot/support",
    "/dashboard/pilot/settings",
    "/dashboard/pilot/certificates",
  ],
  client: [
    "/dashboard/client",
    "/dashboard/client/jobs/new",
    "/dashboard/client/jobs",
    "/dashboard/client/quotes",
    "/dashboard/client/find-pilots",
    "/dashboard/client/messages",
    "/dashboard/client/payments",
    "/dashboard/client/settings",
    "/dashboard/client/bookings",
    "/dashboard/client/disputes",
    "/dashboard/client/reviews",
    "/dashboard/client/profile",
  ],
  admin: [
    "/dashboard/admin",
    "/dashboard/admin/jobs",
    "/dashboard/admin/jobs/approval",
    "/dashboard/admin/users",
    "/dashboard/admin/clients",
    "/dashboard/admin/pilots",
    "/dashboard/admin/disputes",
    "/dashboard/admin/commissions",
    "/dashboard/admin/verifications",
    "/dashboard/admin/subscriptions",
    "/dashboard/admin/cms",
    "/dashboard/admin/shop",
    "/dashboard/admin/configuration",
    "/dashboard/admin/permissions",
    "/dashboard/admin/settings",
  ],
};

const DASHBOARD_ACCOUNTS = {
  pilot: {
    email: process.env.SCREENSHOT_PILOT_EMAIL || "pilot@dronepilot.local",
    password: DEMO_PASSWORD,
    homePrefix: "/dashboard/pilot",
    routes: DASHBOARD_ROUTE_SETS.pilot,
  },
  client: {
    email: process.env.SCREENSHOT_CLIENT_EMAIL || "client@dronepilot.local",
    password: DEMO_PASSWORD,
    homePrefix: "/dashboard/client",
    routes: DASHBOARD_ROUTE_SETS.client,
  },
  admin: {
    email: process.env.SCREENSHOT_ADMIN_EMAIL || "admin@dronepilot.local",
    password: DEMO_PASSWORD,
    homePrefix: "/dashboard/admin",
    routes: DASHBOARD_ROUTE_SETS.admin,
  },
};

/** Fallback public routes when crawl finds few links. */
const SEED_PATHS = [
  "/",
  "/about",
  "/contact",
  "/pricing",
  "/how-it-works",
  "/for-clients",
  "/for-pilots",
  "/pilots",
  "/safety",
  "/terms",
  "/privacy",
  "/cookies",
  "/resources",
  "/captains-club",
  "/waitlist",
];

const SKIP_PATH_REGEXES = [
  /^\/dashboard(?:\/|$)/i,
  /^\/admin(?:\/|$)/i,
  /^\/moderator(?:\/|$)/i,
  /^\/api(?:\/|$)/i,
  /^\/client(?:\/|$)/i,
  /\/login(?:\/|$)/i,
  /\/logout(?:\/|$)/i,
  /\/register(?:\/|$)/i,
  /\/checkout(?:\/|$)/i,
  /\/cart(?:\/|$)/i,
  /\/account(?:\/|$)/i,
  /\/settings(?:\/|$)/i,
  /\/onboarding(?:\/|$)/i,
];

function log(message) {
  process.stdout.write(`${message}\n`);
}

function warn(message) {
  process.stderr.write(`${message}\n`);
}

function normalizePathname(pathname) {
  if (!pathname || pathname === "/") return "/";
  const withoutTrailing = pathname.replace(/\/+$/, "") || "/";
  return withoutTrailing;
}

function shouldSkipUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return true;
    }
    const pathname = normalizePathname(parsed.pathname);
    if (SKIP_PATH_REGEXES.some((re) => re.test(pathname))) {
      return true;
    }
    if (parsed.search && /(?:^|[?&])(q|query|search)=/i.test(parsed.search)) {
      return true;
    }
    const lower = parsed.pathname.toLowerCase();
    if (
      lower.includes("/_next/") ||
      lower.endsWith(".xml") ||
      lower.endsWith(".json") ||
      lower.endsWith(".ico") ||
      lower.endsWith(".png") ||
      lower.endsWith(".jpg") ||
      lower.endsWith(".svg") ||
      lower.endsWith(".webp") ||
      lower.endsWith(".pdf")
    ) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

function dashboardPathToFilename(pathname) {
  const normalized = normalizePathname(pathname);
  if (normalized === "/dashboard/pilot") return "dashboard-pilot.png";
  if (normalized === "/dashboard/client") return "dashboard-client.png";
  if (normalized === "/dashboard/admin") return "dashboard-admin.png";
  const slug = normalized
    .replace(/^\/dashboard\//, "dashboard-")
    .replace(/\//g, "-")
    .toLowerCase();
  return `${slug}.png`;
}

function pathToFilename(urlOrPath) {
  const parsed =
    urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")
      ? new URL(urlOrPath)
      : new URL(urlOrPath, "http://local");
  const normalized = normalizePathname(parsed.pathname);
  let base =
    normalized === "/"
      ? "home"
      : normalized
          .slice(1)
          .toLowerCase()
          .replace(/\//g, "-")
          .replace(/[^a-z0-9-]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "") || "page";

  if (parsed.search) {
    const qs = [...parsed.searchParams.entries()]
      .filter(([key]) => !/^(q|query|search)$/i.test(key))
      .map(([key, value]) => `${key}-${value}`)
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 48);
    if (qs) base = `${base}-${qs}`;
  }

  return `${base}.png`;
}

function resolveConfiguredBaseUrl() {
  const candidates = [
    process.env.SCREENSHOT_BASE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, "")}`
      : null,
  ].filter(Boolean);

  for (const raw of candidates) {
    try {
      const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
      return url.origin;
    } catch {
      /* try next */
    }
  }
  return null;
}

async function isReachable(baseUrl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const res = await fetch(baseUrl, {
      signal: controller.signal,
      redirect: "follow",
    });
    return res.ok || res.status === 304;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function waitForUrl(url, timeoutMs) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      if (await isReachable(url)) {
        resolve();
        return;
      }
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }
      setTimeout(tick, 1_000);
    };
    void tick();
  });
}

async function startLocalServer(port) {
  const baseUrl = `http://127.0.0.1:${port}`;
  if (await isReachable(baseUrl)) {
    log(`Using existing local server at ${baseUrl}`);
    return { baseUrl, proc: null };
  }

  const useProd =
    process.env.SCREENSHOT_USE_PROD === "true" && existsSync(join(ROOT, ".next"));
  const args = useProd ? ["run", "start"] : ["run", "dev"];
  log(
    useProd
      ? `Starting production server on port ${port}…`
      : `Starting dev server on port ${port}…`,
  );

  const proc = spawn(npmCmd, args, {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port), HOSTNAME: "127.0.0.1" },
    stdio: ["ignore", "pipe", "pipe"],
    shell: isWindows,
  });

  proc.stdout?.on("data", (chunk) => {
    const text = chunk.toString();
    if (process.env.SCREENSHOT_VERBOSE === "true") {
      process.stdout.write(text);
    }
  });
  proc.stderr?.on("data", (chunk) => {
    if (process.env.SCREENSHOT_VERBOSE === "true") {
      process.stderr.write(chunk.toString());
    }
  });

  const cleanup = () => {
    if (!proc.killed) {
      proc.kill("SIGTERM");
    }
  };
  process.on("exit", cleanup);
  process.on("SIGINT", () => {
    cleanup();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    cleanup();
    process.exit(143);
  });

  await waitForUrl(baseUrl, 120_000);
  log(`Local server ready at ${baseUrl}`);
  return { baseUrl, proc };
}

async function fetchSitemapUrls(baseUrl) {
  const endpoints = ["/sitemap.xml", "/sitemap_index.xml"];
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, { redirect: "follow" });
      if (!res.ok) continue;
      const text = await res.text();
      const locs = [...text.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(
        (match) => match[1].trim(),
      );
      if (locs.length > 0) {
        log(`Found ${locs.length} URL(s) in ${endpoint}`);
        return locs;
      }
    } catch {
      /* try next endpoint */
    }
  }
  return null;
}

async function collectUrlsFromCrawl(baseUrl, browser) {
  const origin = new URL(baseUrl).origin;
  const visited = new Set();
  const queue = [{ url: `${origin}/`, depth: 0 }];
  const collected = [];

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    isMobile: true,
  });
  const page = await context.newPage();

  while (queue.length > 0 && collected.length < MAX_PAGES) {
    const { url, depth } = queue.shift();
    const normalized = normalizeUrl(url, origin);
    if (!normalized || visited.has(normalized) || shouldSkipUrl(normalized)) {
      continue;
    }
    visited.add(normalized);
    collected.push(normalized);

    if (depth >= CRAWL_MAX_DEPTH) continue;

    try {
      await page.goto(normalized, {
        waitUntil: "domcontentloaded",
        timeout: NAV_TIMEOUT_MS,
      });
      const hrefs = await page.$$eval("a[href]", (anchors) =>
        anchors.map((a) => a.getAttribute("href")).filter(Boolean),
      );
      for (const href of hrefs) {
        const absolute = toAbsoluteUrl(href, origin);
        if (!absolute) continue;
        const absNormalized = normalizeUrl(absolute, origin);
        if (
          !absNormalized ||
          visited.has(absNormalized) ||
          shouldSkipUrl(absNormalized)
        ) {
          continue;
        }
        queue.push({ url: absNormalized, depth: depth + 1 });
      }
    } catch (error) {
      warn(`Crawl skipped ${normalized}: ${error.message}`);
    }
  }

  await context.close();
  return collected;
}

function toAbsoluteUrl(href, origin) {
  try {
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return null;
    }
    return new URL(href, origin).href;
  } catch {
    return null;
  }
}

function normalizeUrl(url, origin) {
  try {
    const parsed = new URL(url, origin);
    if (parsed.origin !== origin) return null;
    parsed.hash = "";
    parsed.pathname = normalizePathname(parsed.pathname);
    return parsed.href;
  } catch {
    return null;
  }
}

function mergeSeedUrls(baseUrl, urls) {
  const origin = new URL(baseUrl).origin;
  const set = new Set(urls);
  for (const path of SEED_PATHS) {
    const href = `${origin}${path}`;
    if (!shouldSkipUrl(href)) {
      set.add(href);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

async function dismissOverlays(page) {
  const clickSelectors = [
    'button:has-text("Accept")',
    'button:has-text("Accept all")',
    'button:has-text("Accept All")',
    'button:has-text("I agree")',
    'button:has-text("Got it")',
    'button:has-text("OK")',
    '[data-testid*="cookie" i]',
    '[aria-label*="cookie" i]',
  ];

  for (const selector of clickSelectors) {
    try {
      const locator = page.locator(selector).first();
      if (await locator.isVisible({ timeout: 400 })) {
        await locator.click({ timeout: 2_000 });
        await page.waitForTimeout(250);
      }
    } catch {
      /* no matching banner */
    }
  }

  try {
    await page.addStyleTag({
      content: `
        [class*="cookie" i],
        [id*="cookie" i],
        [class*="consent" i],
        [id*="consent" i],
        [aria-label*="cookie" i] {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `,
    });
  } catch {
    /* ignore */
  }
}

async function loginToDashboard(page, baseUrl, account) {
  await page.goto(`${baseUrl}/login`, {
    waitUntil: "load",
    timeout: NAV_TIMEOUT_MS,
  });
  await page.fill("#email", account.email);
  await page.fill("#password", account.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(
    (url) => url.pathname.startsWith(account.homePrefix),
    { timeout: NAV_TIMEOUT_MS },
  );
  await page.waitForTimeout(POST_LOAD_DELAY_MS);
  log(`Logged in as ${account.email}`);
}

async function captureUrlBatch({
  page,
  baseUrl,
  urls,
  manifest,
  failures,
  usedNames,
  filenameFn = pathToFilename,
}) {
  for (const url of urls) {
    let filename = filenameFn(url.startsWith("http") ? url : `${baseUrl}${url}`);
    if (usedNames.has(filename)) {
      const suffix = Buffer.from(url).toString("base64url").slice(0, 8);
      filename = filename.replace(/\.png$/, `-${suffix}.png`);
    }
    usedNames.add(filename);
    const absolute = url.startsWith("http") ? url : `${baseUrl}${url}`;
    const outputPath = join(OUTPUT_DIR, filename);

    try {
      log(`Screenshot: ${absolute} → ${filename}`);
      await captureScreenshot(page, absolute, outputPath);
      manifest.push({ url: absolute, filename, status: "ok" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      warn(`FAILED: ${absolute} — ${message}`);
      failures.push({ url: absolute, error: message });
      manifest.push({ url: absolute, filename, status: "failed", error: message });
    }
  }
}

function includeDashboardScreenshots() {
  return process.env.SCREENSHOT_INCLUDE_DASHBOARD !== "false";
}

function dashboardRolesToCapture() {
  const roles = ["pilot", "client"];
  if (process.env.SCREENSHOT_INCLUDE_ADMIN === "true") {
    roles.push("admin");
  }
  return roles;
}

async function captureScreenshot(page, url, outputPath) {
  await page.goto(url, {
    waitUntil: "load",
    timeout: NAV_TIMEOUT_MS,
  });

  try {
    await page.waitForLoadState("networkidle", { timeout: NETWORK_IDLE_MS });
  } catch {
    /* networkidle is best-effort */
  }

  await page.waitForTimeout(POST_LOAD_DELAY_MS);
  await dismissOverlays(page);
  await page.waitForTimeout(200);

  await page.screenshot({
    path: outputPath,
    fullPage: true,
    animations: "disabled",
  });
}

async function createZipFromFolder(sourceDir, zipPath) {
  if (existsSync(zipPath)) {
    rmSync(zipPath, { force: true });
  }

  await new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

async function ensurePlaywrightBrowser() {
  const require = createRequire(import.meta.url);
  try {
    const executablePath = chromium.executablePath();
    if (executablePath && existsSync(executablePath)) {
      return;
    }
  } catch {
    /* fall through to install */
  }

  log("Installing Playwright Chromium (first run only)…");
  await new Promise((resolve, reject) => {
    const proc = spawn(
      npmCmd,
      ["exec", "--", "playwright", "install", "chromium"],
      {
        cwd: ROOT,
        stdio: "inherit",
        shell: isWindows,
      },
    );
    proc.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`playwright install exited with code ${code}`));
    });
  });
}

async function main() {
  const port = Number(process.env.PORT || 3000);
  const configured = resolveConfiguredBaseUrl();
  let baseUrl = configured;
  let serverProc = null;

  if (!baseUrl) {
    const local = await startLocalServer(port);
    baseUrl = local.baseUrl;
    serverProc = local.proc;
  } else {
    log(`Using configured base URL: ${baseUrl}`);
    if (!(await isReachable(baseUrl))) {
      warn(`Warning: ${baseUrl} is not reachable. Trying local server…`);
      const local = await startLocalServer(port);
      baseUrl = local.baseUrl;
      serverProc = local.proc;
    }
  }

  await ensurePlaywrightBrowser();

  if (existsSync(OUTPUT_DIR)) {
    rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  let urls = await fetchSitemapUrls(baseUrl);
  if (!urls || urls.length === 0) {
    log("No sitemap.xml found — crawling internal links from homepage…");
    urls = await collectUrlsFromCrawl(baseUrl, browser);
  } else {
    urls = urls
      .map((href) => normalizeUrl(href, new URL(baseUrl).origin))
      .filter(Boolean);
  }

  urls = mergeSeedUrls(baseUrl, urls).slice(0, MAX_PAGES);
  log(
    `Capturing ${urls.length} public page(s) at ${VIEWPORT.width}x${VIEWPORT.height} (scale ${DEVICE_SCALE_FACTOR})…`,
  );

  const browserContextOptions = {
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    isMobile: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  };

  const manifest = [];
  const failures = [];
  const usedNames = new Set();

  const publicContext = await browser.newContext(browserContextOptions);
  const publicPage = await publicContext.newPage();
  await captureUrlBatch({
    page: publicPage,
    baseUrl,
    urls,
    manifest,
    failures,
    usedNames,
  });
  await publicContext.close();

  if (includeDashboardScreenshots()) {
    for (const role of dashboardRolesToCapture()) {
      const account = DASHBOARD_ACCOUNTS[role];
      log(`Capturing ${role} dashboard (${account.routes.length} routes)…`);
      const context = await browser.newContext(browserContextOptions);
      const page = await context.newPage();
      try {
        await loginToDashboard(page, baseUrl, account);
        await captureUrlBatch({
          page,
          baseUrl,
          urls: account.routes,
          manifest,
          failures,
          usedNames,
          filenameFn: (url) => dashboardPathToFilename(new URL(url).pathname),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        warn(`FAILED: ${role} dashboard login — ${message}`);
        failures.push({ url: `${baseUrl}/login (${role})`, error: message });
      }
      await context.close();
    }
  } else {
    log("Skipping dashboard screenshots (SCREENSHOT_INCLUDE_DASHBOARD=false).");
  }

  await browser.close();

  if (serverProc) {
    serverProc.kill("SIGTERM");
  }

  writeFileSync(
    join(OUTPUT_DIR, "manifest.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        baseUrl,
        viewport: { ...VIEWPORT, deviceScaleFactor: DEVICE_SCALE_FACTOR },
        captured: manifest.filter((entry) => entry.status === "ok").length,
        failed: failures.length,
        includeDashboard: includeDashboardScreenshots(),
        dashboardRoles: includeDashboardScreenshots() ? dashboardRolesToCapture() : [],
        pages: manifest,
      },
      null,
      2,
    ),
    "utf8",
  );

  const okCount = manifest.filter((entry) => entry.status === "ok").length;
  if (okCount === 0) {
    throw new Error("No screenshots were captured successfully.");
  }

  await createZipFromFolder(OUTPUT_DIR, ZIP_PATH);

  log("");
  log(`Done. ${okCount} screenshot(s) saved.`);
  if (failures.length > 0) {
    warn(`${failures.length} page(s) failed — see manifest.json for details.`);
  }
  log(`Folder: ${OUTPUT_DIR}`);
  log(`ZIP:    ${ZIP_PATH}`);
}

main().catch((error) => {
  warn(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
