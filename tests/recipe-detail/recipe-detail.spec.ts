import { expect, test } from "@playwright/test";
import { mockApiRoutes } from "../helpers";

/**
 * Monkey-patches navigator.wakeLock before any app code runs so we can
 * spy on request() and release() calls without touching application code.
 *
 * The spy log persists across page navigations — addInitScript fires on
 * every goto(), but we only initialise the arrays once and only patch
 * navigator.wakeLock once so data written during a page's unload isn't
 * wiped by the next page's init script.
 *
 * Each sentinel carries its own `released` flag. The spy also keeps a
 * reference to the most-recently-created sentinel so the test can check
 * whether the lock held by the previous page was released.
 */
async function installWakeLockSpy(page: import("@playwright/test").Page) {
	await page.addInitScript(() => {
		class MockWakeLockSentinel extends EventTarget {
			type = "screen";
			released = false;
			release() {
				this.released = true;
				(window as any).__wakeLockSpy.releases.push({ type: this.type });
				this.dispatchEvent(new Event("release"));
				return Promise.resolve();
			}
		}

		if (!(window as any).__wakeLockSpy) {
			(window as any).__wakeLockSpy = {
				requests: [] as Array<{ type: string }>,
				releases: [] as Array<{ type: string }>,
				lastSentinel: null as InstanceType<
					typeof MockWakeLockSentinel
				> | null,
			};
		}

		if (!(navigator as any).__wakeLockPatched) {
			(navigator as any).__wakeLockPatched = true;
			Object.defineProperty(navigator, "wakeLock", {
				value: {
					request: (type: string) => {
						(window as any).__wakeLockSpy.requests.push({ type });
						const s = new MockWakeLockSentinel();
						(window as any).__wakeLockSpy.lastSentinel = s;
						return Promise.resolve(s);
					},
				},
				writable: true,
				configurable: true,
			});
		}
	});
}

test.describe("Recipe detail page", () => {
	/**
	 * UI behavior tests — auth state doesn't matter for these.
	 */
	test.describe("UI behavior", () => {
		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
		});

		/**
		 * Navigate to the recipes list first, click the first result, and verify
		 * the detail page loads correctly. This test requires at least one recipe
		 * to exist in the system.
		 */
		test("navigates from list to recipe detail", async ({ page }) => {
			await page.goto("/recipes");

			const firstRecipeLink = page.locator("a").filter({ has: page.locator("h3") }).first();
			await expect(firstRecipeLink).toBeVisible({ timeout: 10000 });

			const recipeTitle = await firstRecipeLink.locator("h3").textContent();
			await firstRecipeLink.click();

			await expect(page).toHaveURL(/\/[^/]+$/);
			// The heading on the detail page should match the clicked recipe title
			await expect(
				page.getByRole("heading", { name: recipeTitle ?? "" }),
			).toBeVisible({ timeout: 10000 });
		});
	});

	/**
	 * When no auth tokens are present (or the refresh token is expired), the
	 * detail page must call the anonymous /anonymous/recipes/{slug} endpoint.
	 */
	test.describe("anonymous (not logged in)", () => {
		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
		});

		test("fetches recipe from the anonymous API endpoint", async ({ page }) => {
			const requestPromise = page.waitForRequest(
				(request) =>
					request.method() === "GET" &&
					request.url().includes("/anonymous/recipes/"),
			);
			await page.goto("/pasta-carbonara");
			const request = await requestPromise;
			expect(request.url()).toContain("/anonymous/recipes/");
		});

		test("renders the recipe from the anonymous endpoint", async ({ page }) => {
			await page.goto("/pasta-carbonara");
			await expect(
				page.getByRole("heading", { name: "Pasta Carbonara" }),
			).toBeVisible({ timeout: 10000 });
		});
	});

	/**
	 * When the user is logged in (valid refreshExpiresAt in localStorage), the
	 * detail page must call the authenticated /recipes/{slug} endpoint instead
	 * of the anonymous one.
	 */
	test.describe("authenticated (logged in)", () => {
		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			// Simulate a logged-in user with a valid refresh token.
			await page.addInitScript(() => {
				const future = new Date(Date.now() + 86400000).toString();
				localStorage.setItem("userId", "test-user-1");
				localStorage.setItem("expiresAt", future);
				localStorage.setItem("refreshExpiresAt", future);
			});
		});

		test("fetches recipe from the authenticated /recipes/{slug} endpoint", async ({
			page,
		}) => {
			const requestPromise = page.waitForRequest(
				(request) =>
					request.method() === "GET" &&
					request.url().includes("/api/recipes/") &&
					!request.url().includes("/anonymous/"),
			);
			await page.goto("/pasta-carbonara");
			const request = await requestPromise;
			expect(request.url()).toContain("/api/recipes/");
			expect(request.url()).not.toContain("/anonymous/");
		});

		test("renders the recipe from the authenticated endpoint", async ({
			page,
		}) => {
			await page.goto("/pasta-carbonara");
			await expect(
				page.getByRole("heading", { name: "Pasta Carbonara" }),
			).toBeVisible({ timeout: 10000 });
		});

		test("shows edit and delete buttons when user owns the recipe", async ({
			page,
		}) => {
			// Override the userId to match the mock recipe's authorId so the
			// ownership check (userId === recipeData.authorId) passes.
			await page.addInitScript(() => {
				localStorage.setItem("userId", "user1");
			});
			await page.goto("/pasta-carbonara");
			await expect(
				page.getByRole("button", { name: "Edit Recipe" }),
			).toBeVisible({ timeout: 10000 });
			await expect(
				page.getByRole("button", { name: "Delete Recipe" }),
			).toBeVisible({ timeout: 10000 });
		});
	});

	/**
	 * Screen Wake Lock — the recipe detail page uses useWakeLock() to
	 * prevent the device from sleeping while the user is reading (e.g.
	 * while cooking).
	 */
	test.describe("Screen Wake Lock", () => {
		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await installWakeLockSpy(page);
		});

		test("requests a screen wake lock when viewing a recipe", async ({
			page,
		}) => {
			await page.goto("/pasta-carbonara");

			await expect(
				page.getByRole("heading", { name: "Pasta Carbonara" }),
			).toBeVisible({ timeout: 10000 });

			const requests: Array<{ type: string }> = await page.evaluate(
				() => (window as any).__wakeLockSpy.requests,
			);
			// React Strict Mode in dev may double-mount; assert at least one.
			expect(requests.length).toBeGreaterThanOrEqual(1);
			expect(requests[0].type).toBe("screen");
		});

		test("releases the wake lock when navigating away from a recipe", async ({
			page,
		}) => {
			await page.goto("/pasta-carbonara");
			await expect(
				page.getByRole("heading", { name: "Pasta Carbonara" }),
			).toBeVisible({ timeout: 10000 });

			// Snapshot: the sentinel should exist and not yet be released.
			const sentinelExists = await page.evaluate(
				() => (window as any).__wakeLockSpy.lastSentinel !== null,
			);
			expect(sentinelExists).toBe(true);

			// Click the Recipes link in the sidebar for a client-side
			// navigation — this keeps the same window, so the spy survives.
			await page.getByRole("link", { name: "Recipes" }).click();
			await expect(
				page.getByRole("heading", { name: "Recipes" }),
			).toBeVisible({ timeout: 10000 });

			const wasReleased: boolean = await page.evaluate(
				() =>
					(window as any).__wakeLockSpy.lastSentinel?.released ?? false,
			);
			expect(wasReleased).toBe(true);
		});

		test("does not request a wake lock on pages that do not use it", async ({
			page,
		}) => {
			await page.goto("/recipes");
			await expect(
				page.getByRole("heading", { name: "Recipes" }),
			).toBeVisible({ timeout: 10000 });

			const requests: Array<{ type: string }> = await page.evaluate(
				() => (window as any).__wakeLockSpy.requests,
			);
			expect(requests).toHaveLength(0);
		});
	});
});
