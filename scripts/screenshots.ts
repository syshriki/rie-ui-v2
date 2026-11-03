/**
 * Screenshot script — captures every page at every responsive breakpoint.
 *
 * Usage:
 *   npx tsx scripts/screenshots.ts               # all pages
 *   npx tsx scripts/screenshots.ts login          # only the login page
 *   npm run screenshots                           # all pages
 *   npm run screenshots -- login                  # only the login page
 *
 * The dev server is started automatically. Screenshots are saved to
 * screenshots/ and overwritten on each run.
 *
 * Three views per page: desktop + tablet breakpoints in a plain context, and a
 * mobile view captured through the iPhone 12 device descriptor. Pages flagged
 * with `captureMenu` also get the mobile dropdown open as an extra state.
 */

import { chromium, devices } from "@playwright/test";
import type { Browser, Page } from "@playwright/test";
import { spawn, type ChildProcess } from "child_process";
import fs from "fs";
import http from "http";
import path from "path";
import { mockApiRoutes, mockAuthenticatedUser } from "../tests/helpers";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const SCREENSHOTS_DIR = path.resolve(__dirname, "../screenshots");
const DEV_SERVER_START_TIMEOUT_MS = 60_000;

/** Desktop and tablet breakpoints. Mobile comes from the device descriptor. */
const VIEWPORTS = [
  { name: "900px", width: 900, height: 900 },
  { name: "1440px", width: 1440, height: 900 },
] as const;

/** Ids from src/components/Page/MobileTopBar/MobileTopBar.tsx. */
const MENU_TRIGGER_ID = "footer-menu-trigger";
const MENU_ID = "footer-menu";

/** Injected element marking where one screenful of content ends. */
const FOLD_MARKER_ID = "screenshots-fold-marker";
const FOLD_MARKER_STYLE_ID = "screenshots-fold-marker-style";

/**
 * Mobile view. Device descriptors carry viewport, DPR, touch and UA, so they
 * need their own browser context (they can't be applied to an existing page).
 */
const MOBILE_DEVICE = "iphone12";
const DEVICES = {
  iphone12: devices["iPhone 12"],
} as const;

/** The emulated device is a 3x display — capture at true device pixels. */
const DEVICE_SCALE_FACTOR = 3;

interface PageEntry {
  /** URL path (without host). */
  route: string;
  /** Short label used in the filename. */
  label: string;
  /** Whether this page needs authentication (localStorage + user mocks). */
  needsAuth: boolean;
  /** Optional CSS selector to wait for before taking screenshots. */
  waitFor?: string;
  /** Also capture the mobile dropdown menu open. */
  captureMenu?: boolean;
}

const PAGES: PageEntry[] = [
  // ── Anonymous ───────────────────────────────────────────────────────
  {
    route: "/recipes",
    label: "recipes",
    needsAuth: false,
    waitFor: "h3",
    captureMenu: true,
  },
  {
    route: "/pasta-carbonara",
    label: "recipe-detail",
    needsAuth: false,
    waitFor: "h1",
  },
  { route: "/login", label: "login", needsAuth: false, waitFor: "h1" },
  { route: "/privacy", label: "privacy", needsAuth: false, waitFor: "h1" },
  { route: "/terms", label: "terms", needsAuth: false, waitFor: "h1" },
  // ── Authenticated ───────────────────────────────────────────────────
  {
    route: "/profile",
    label: "profile",
    needsAuth: true,
    waitFor: "h1",
  },
  { route: "/add", label: "add", needsAuth: true, waitFor: "h1" },
  {
    route: "/edit/pasta-carbonara",
    label: "edit",
    needsAuth: true,
    waitFor: "h1",
  },
  // ── Edge cases ──────────────────────────────────────────────────────
  {
    route: "/not-found-page",
    label: "error",
    needsAuth: false,
    waitFor: "h1",
  },
];

// ---------------------------------------------------------------------------
// Optional page filter (first CLI argument)
// ---------------------------------------------------------------------------

const targetPage = process.argv[2];
const pages = targetPage
  ? PAGES.filter((p) => p.label === targetPage)
  : PAGES;

if (targetPage && pages.length === 0) {
  console.error(
    `❌ Unknown page "${targetPage}". Available pages: ${PAGES.map((p) => p.label).join(", ")}`,
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function poll() {
      http
        .get(url, (res) => {
          res.resume();
          resolve();
        })
        .on("error", () => {
          if (Date.now() - start > timeoutMs) {
            reject(
              new Error(
                `Dev server not ready at ${url} after ${timeoutMs}ms`,
              ),
            );
          } else {
            setTimeout(poll, 500);
          }
        });
    }
    poll();
  });
}

function isServerRunning(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    http
      .get(url, (res) => {
        res.resume();
        resolve(true);
      })
      .on("error", () => resolve(false));
  });
}

function startDevServer(): ChildProcess {
  const server = spawn("npm", ["run", "dev"], {
    stdio: "pipe",
    env: { ...process.env },
    shell: true,
  });

  // Pipe output so we can see startup progress (and catch errors)
  server.stdout?.on("data", (chunk: Buffer) => {
    const line = chunk.toString().trim();
    if (line) console.log(`  [dev] ${line}`);
  });
  server.stderr?.on("data", (chunk: Buffer) => {
    const line = chunk.toString().trim();
    if (line) console.log(`  [dev:err] ${line}`);
  });

  return server;
}

// ---------------------------------------------------------------------------
// Dev server lifecycle
// ---------------------------------------------------------------------------

/**
 * Makes sure a dev server answers at BASE_URL. Returns the process we spawned,
 * or null when one was already running (we don't own it then).
 */
async function ensureDevServer(): Promise<ChildProcess | null> {
  if (await isServerRunning(BASE_URL)) {
    console.log(`Dev server already running at ${BASE_URL}\n`);
    return null;
  }

  console.log("Starting dev server…");
  const server = startDevServer();
  await waitForServer(BASE_URL, DEV_SERVER_START_TIMEOUT_MS);
  console.log("Dev server ready.\n");
  return server;
}

/** Only kill the dev server if we started it ourselves. */
async function stopDevServer(server: ChildProcess | null): Promise<void> {
  if (!server) return;
  server.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 500));
}

function prepareOutputDir(): string {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  console.log(`Output: ${SCREENSHOTS_DIR}\n`);
  return SCREENSHOTS_DIR;
}

// ---------------------------------------------------------------------------
// Capture phases
// ---------------------------------------------------------------------------

/**
 * Mocks the API, navigates, and waits until the page is visually stable.
 * `waitFor` overrides the page's selector when a layout hides it.
 */
async function preparePage(
  page: Page,
  entry: PageEntry,
  waitFor = entry.waitFor,
): Promise<void> {
  await mockApiRoutes(page); // must happen before navigation

  if (entry.needsAuth) {
    await mockAuthenticatedUser(page, "user1");
  }

  await page.goto(`${BASE_URL}${entry.route}`, {
    waitUntil: "networkidle",
    timeout: 15_000,
  });

  await waitForContent(page, waitFor);
  await page.waitForTimeout(500); // let layout settle
}

async function waitForContent(
  page: Page,
  selector: string | undefined,
): Promise<void> {
  if (!selector) return;

  try {
    await page.locator(selector).first().waitFor({ timeout: 10_000 });
  } catch {
    console.log(`  ⚠ selector "${selector}" not found — continuing anyway`);
  }
}

async function saveScreenshot(
  page: Page,
  outputDir: string,
  filename: string,
): Promise<void> {
  await page.screenshot({
    path: path.join(outputDir, filename),
    fullPage: true,
  });
  console.log(`  ✓ ${filename}`);
}

/**
 * Full-page captures are several screens tall. This variant first marks where
 * the device's first screen ends, so the fold stays readable in one image.
 * Only used for the mobile device captures.
 */
async function saveScreenState(
  page: Page,
  outputDir: string,
  filename: string,
  viewportHeight: number,
): Promise<void> {
  await showFoldMarker(page, viewportHeight);
  try {
    await saveScreenshot(page, outputDir, filename);
  } finally {
    await hideFoldMarker(page);
  }
}

/**
 * Draws a dashed line + label at `viewportHeight` from the document top.
 *
 * The marker is itself a manual popover so it lands in the top layer, above any
 * open dropdown — otherwise the menu would paint over the fold label. That puts
 * it in the app's global `:popover-open` / `::backdrop` rules (see
 * src/app/globals.css), hence the neutralising stylesheet below.
 */
async function showFoldMarker(
  page: Page,
  viewportHeight: number,
): Promise<void> {
  await page.evaluate(
    ({ id, styleId, height }) => {
      document.getElementById(id)?.remove();

      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        #${id} {
          width: 100% !important;
          max-width: none !important;
          display: block !important;
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          border-top: 2px dashed #c0392b !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow: visible !important;
        }
        #${id}::backdrop {
          backdrop-filter: none !important;
          background: transparent !important;
        }
      `;
      document.getElementById(styleId)?.remove();
      document.head.appendChild(style);

      const marker = document.createElement("div");
      marker.id = id;
      marker.setAttribute("popover", "manual");
      Object.assign(marker.style, {
        position: "absolute",
        top: `${height}px`,
        left: "0",
        height: "0",
        zIndex: "2147483647",
        pointerEvents: "none",
      });

      const label = document.createElement("span");
      label.textContent = `▲ end of first screen (${height}px)`;
      Object.assign(label.style, {
        float: "right",
        background: "#fff",
        color: "#c0392b",
        font: "600 11px/1.6 Montserrat, sans-serif",
        padding: "1px 6px",
        marginTop: "-1px",
        marginRight: "10px",
        border: "1px dashed #c0392b",
        borderTop: "none",
      });

      marker.appendChild(label);
      document.documentElement.appendChild(marker);
      (marker as HTMLElement & { showPopover?: () => void }).showPopover?.();
    },
    { id: FOLD_MARKER_ID, styleId: FOLD_MARKER_STYLE_ID, height: viewportHeight },
  );

  await page.waitForTimeout(100);
}

async function hideFoldMarker(page: Page): Promise<void> {
  await page.evaluate((id) => {
    const marker = document.getElementById(id) as
      | (HTMLElement & { hidePopover?: () => void })
      | null;
    marker?.hidePopover?.();
    marker?.remove();
  }, FOLD_MARKER_ID);
}

/** Desktop + tablet breakpoints: plain, unmarked captures. */
async function captureViewports(
  page: Page,
  outputDir: string,
  entry: PageEntry,
): Promise<number> {
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(300);
    await saveScreenshot(page, outputDir, `${entry.label}-${vp.name}.png`);
  }
  return VIEWPORTS.length;
}

/**
 * Opens the dropdown, screenshots it (fold line included), then closes it.
 */
async function captureOpenMenu(
  page: Page,
  outputDir: string,
  filename: string,
  viewportHeight: number,
): Promise<number> {
  const trigger = page.locator(`#${MENU_TRIGGER_ID}`);
  if ((await trigger.count()) === 0) {
    console.log("  ⚠ no menu trigger on this page — skipping menu capture");
    return 0;
  }

  await trigger.first().click();
  await page
    .locator(`#${MENU_ID}`)
    .first()
    .waitFor({ state: "visible", timeout: 5_000 });
  await page.waitForTimeout(300);

  await saveScreenState(page, outputDir, filename, viewportHeight);
  await closeMenu(page);
  return 1;
}

/** Popovers stay open across resizes, so close it before the next capture. */
async function closeMenu(page: Page): Promise<void> {
  await page.evaluate((id) => {
    const menu = document.getElementById(id) as
      | (HTMLElement & { hidePopover?: () => void })
      | null;
    menu?.hidePopover?.();
  }, MENU_ID);

  await page
    .locator(`#${MENU_ID}`)
    .first()
    .waitFor({ state: "hidden", timeout: 5_000 });
}

/** Print/media-emulated layout. */
async function capturePrintLayout(
  page: Page,
  outputDir: string,
  entry: PageEntry,
): Promise<number> {
  await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(300);
  await saveScreenshot(page, outputDir, `${entry.label}-print.png`);
  await page.emulateMedia({ media: null });
  return 1;
}

/** Mobile view. DPR/touch/UA are context-level, so it needs its own context. */
async function captureMobileState(
  browser: Browser,
  entry: PageEntry,
  outputDir: string,
): Promise<number> {
  const device = DEVICES[MOBILE_DEVICE];
  const context = await browser.newContext({
    ...device,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
  });
  const page = await context.newPage();
  const viewportHeight = device.viewport.height;

  try {
    // The desktop header (and its h1) is hidden below 900px, so anchor on the
    // mobile top bar instead when the page has one.
    await preparePage(page, entry, `#${MENU_TRIGGER_ID}, h1`);
    await saveScreenState(
      page,
      outputDir,
      `${entry.label}-${MOBILE_DEVICE}.png`,
      viewportHeight,
    );

    const menuCount = entry.captureMenu
      ? await captureOpenMenu(
          page,
          outputDir,
          `${entry.label}-${MOBILE_DEVICE}-menu.png`,
          viewportHeight,
        )
      : 0;

    return 1 + menuCount;
  } catch (err) {
    console.log(`  ❌ Failed (${MOBILE_DEVICE}): ${err}`);
    return 0;
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

/** Desktop + tablet breakpoints and print layout, in one plain context. */
async function captureResponsiveStates(
  browser: Browser,
  entry: PageEntry,
  outputDir: string,
): Promise<number> {
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await preparePage(page, entry);

    return (
      (await captureViewports(page, outputDir, entry)) +
      (await capturePrintLayout(page, outputDir, entry))
    );
  } catch (err) {
    console.log(`  ❌ Failed: ${err}`);
    return 0;
  } finally {
    await context.close();
  }
}

async function capturePage(
  browser: Browser,
  entry: PageEntry,
  outputDir: string,
): Promise<number> {
  console.log(`▶ ${entry.route}${entry.needsAuth ? " (auth)" : ""}`);

  return (
    (await captureResponsiveStates(browser, entry, outputDir)) +
    (await captureMobileState(browser, entry, outputDir))
  );
}

async function capturePages(
  browser: Browser,
  outputDir: string,
): Promise<number> {
  let screenshotCount = 0;

  for (const entry of pages) {
    screenshotCount += await capturePage(browser, entry, outputDir);
  }

  return screenshotCount;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const scope = targetPage ? `"${targetPage}"` : "all pages";
  console.log(`📸 Screenshot script starting — ${scope}…\n`);

  // 1. Dev server up
  const server = await ensureDevServer();
  let exitCode = 0;

  try {
    // 2. Where the files land
    const outputDir = prepareOutputDir();

    // 3. Drive every page through every capture phase
    const browser = await chromium.launch();
    try {
      const count = await capturePages(browser, outputDir);
      console.log(`\n✅ ${count} screenshots saved to ${outputDir}`);
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.error("❌ Screenshot script failed:", err);
    exitCode = 1;
  } finally {
    await stopDevServer(server);
  }

  process.exit(exitCode);
}

main();
