/**
 * Screenshot script — captures every page at every responsive breakpoint.
 *
 * Usage:
 *   npx tsx scripts/screenshots.ts
 *   npm run screenshots
 *
 * The dev server is started automatically. Screenshots are saved to
 * screenshots/<commit-hash>/ and are meant to be committed.
 */

import { chromium } from "@playwright/test";
import { execSync, spawn, type ChildProcess } from "child_process";
import fs from "fs";
import http from "http";
import path from "path";
import { mockApiRoutes, mockAuthenticatedUser } from "../tests/helpers.ts";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const SCREENSHOTS_DIR = path.resolve(__dirname, "../screenshots");
const DEV_SERVER_START_TIMEOUT_MS = 60_000;

const VIEWPORTS = [
  { name: "600px", width: 600, height: 900 },
  { name: "900px", width: 900, height: 900 },
  { name: "1440px", width: 1440, height: 900 },
] as const;

interface PageEntry {
  /** URL path (without host). */
  route: string;
  /** Short label used in the filename. */
  label: string;
  /** Whether this page needs authentication (localStorage + user mocks). */
  needsAuth: boolean;
  /** Optional CSS selector to wait for before taking screenshots. */
  waitFor?: string;
}

const PAGES: PageEntry[] = [
  // ── Anonymous ───────────────────────────────────────────────────────
  { route: "/recipes", label: "recipes", needsAuth: false, waitFor: "h3" },
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
// Helpers
// ---------------------------------------------------------------------------

function getCommitHash(): string {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}

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
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("📸 Screenshot script starting…\n");

  // 1. Ensure dev server is running
  const serverAlreadyRunning = await isServerRunning(BASE_URL);
  let server: ChildProcess | null = null;

  if (serverAlreadyRunning) {
    console.log(`Dev server already running at ${BASE_URL}\n`);
  } else {
    console.log("Starting dev server…");
    server = startDevServer();
  }

  let exitCode = 0;
  try {
    if (!serverAlreadyRunning) {
      await waitForServer(BASE_URL, DEV_SERVER_START_TIMEOUT_MS);
      console.log("Dev server ready.\n");
    }

    // 2. Compute output directory
    const commitHash = getCommitHash();
    const outputDir = path.join(SCREENSHOTS_DIR, commitHash);
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Output: ${outputDir}\n`);

    // 3. Launch browser
    const browser = await chromium.launch();

    try {
      let screenshotCount = 0;

      for (const entry of PAGES) {
        console.log(`▶ ${entry.route}${entry.needsAuth ? " (auth)" : ""}`);

        const context = await browser.newContext();
        const page = await context.newPage();

        try {
          // Set up API mocks (must happen before navigation)
          await mockApiRoutes(page);

          if (entry.needsAuth) {
            await mockAuthenticatedUser(page, "user1");
          }

          // Navigate
          await page.goto(`${BASE_URL}${entry.route}`, {
            waitUntil: "networkidle",
            timeout: 15_000,
          });

          // Wait for expected content
          if (entry.waitFor) {
            try {
              await page
                .locator(entry.waitFor)
                .first()
                .waitFor({ timeout: 10_000 });
            } catch {
              console.log(
                `  ⚠ selector "${entry.waitFor}" not found — continuing anyway`,
              );
            }
          }

          // Let layout settle
          await page.waitForTimeout(500);

          // Viewport screenshots
          for (const vp of VIEWPORTS) {
            await page.setViewportSize({ width: vp.width, height: vp.height });
            await page.waitForTimeout(300);

            const filename = `${entry.label}-${vp.name}.png`;
            await page.screenshot({
              path: path.join(outputDir, filename),
              fullPage: true,
            });
            console.log(`  ✓ ${filename}`);
            screenshotCount++;
          }

          // Print layout screenshot
          await page.emulateMedia({ media: "print" });
          await page.waitForTimeout(300);

          const printFilename = `${entry.label}-print.png`;
          await page.screenshot({
            path: path.join(outputDir, printFilename),
            fullPage: true,
          });
          console.log(`  ✓ ${printFilename}`);
          screenshotCount++;

          // Restore screen media
          await page.emulateMedia({ media: null });
        } catch (err) {
          console.log(`  ❌ Failed: ${err}`);
        } finally {
          await context.close();
        }
      }

      console.log(
        `\n✅ ${screenshotCount} screenshots saved to ${outputDir}`,
      );
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.error("❌ Screenshot script failed:", err);
    exitCode = 1;
  } finally {
    // Only kill the dev server if we started it
    if (server) {
      server.kill("SIGTERM");
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  process.exit(exitCode);
}

main();
