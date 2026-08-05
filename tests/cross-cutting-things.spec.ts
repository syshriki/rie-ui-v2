import { type Page, expect, test } from "@playwright/test";
import { MOCK_PROFILE } from "./helpers";

async function setupRoutes(
	page: Page,
	opts?: {
		usersMeStatus?: (callCount: number) => number;
		tokenStatus?: number;
	},
) {
	let usersMeCalls = 0;
	let deleteCalls = 0;

	// Block MSW service worker so a concurrently running mock server
	// (npm run mock) doesn't interfere with Playwright route handlers.
	await page.route("**/mockServiceWorker.js", (route) =>
		route.fulfill({ status: 404 }),
	);
	await page.addInitScript(() => {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.getRegistrations().then((regs) => {
				for (const reg of regs) reg.unregister();
			});
		}
	});

	await page.route("**/*", (route, request) => {
		const url = request.url();
		if (url.includes("localhost:3000/_next")) return route.fallback();

		// Auth endpoints — these go through the app origin (port 3000).
		if (url.includes("/oauth/introspect"))
			return route.fulfill({ status: 401 });
		if (url.includes("/oauth/revoke"))
			return route.fulfill({ status: 200 });
		if (url.includes("/oauth/token")) {
			const status = opts?.tokenStatus ?? 200;
			return route.fulfill({
				status,
				contentType: "application/json",
				body: status === 200
					? JSON.stringify({ expiresAt: Date.now() + 86400000 })
					: "",
			});
		}

		// SDK API calls go to port 8001.
		if (!url.includes("8001")) return route.fallback();

		if (url.includes("/users/me") && request.method() === "GET") {
			usersMeCalls++;
			const status = opts?.usersMeStatus
				? opts.usersMeStatus(usersMeCalls)
				: 200;
			return route.fulfill({
				status,
				contentType: "application/json",
				body: status === 200 ? JSON.stringify(MOCK_PROFILE) : "",
			});
		}
		if (url.includes("/users/me") && request.method() === "PATCH")
			return route.fulfill({
				status: 200, contentType: "application/json",
				body: JSON.stringify({ ...MOCK_PROFILE, username: "Updated" }),
			});
		if (url.includes("/users/") && request.method() === "DELETE") {
			deleteCalls++;
			return route.fulfill({ status: 204 });
		}

		if (url.includes("/anonymous/recipes")) {
			const u = new URL(url);
			const slug = u.pathname.match(/\/anonymous\/recipes\/(.+)/)?.[1];
			return route.fulfill({
				status: 200, contentType: "application/json",
				body: JSON.stringify(slug ? {
					slug, id: 1, title: "Pasta Carbonara",
					description: "A classic.", recipe: "Boil pasta.",
					authorId: "user1", authorUsername: "chef",
					createdAt: Date.now(), updatedAt: Date.now(), isFavorite: false,
				} : {
					recipes: [{
						slug: "pasta-carbonara", id: 1,
						title: "Pasta Carbonara", description: "A classic.",
						recipe: "Boil pasta.", authorId: "user1",
						createdAt: Date.now(), updatedAt: Date.now(),
						isFavorite: false,
					}],
					pagination: {
						currentPage: 1, pageSize: 20, totalItems: 1,
						totalPages: 1, hasNextPage: false, hasPreviousPage: false,
					},
				}),
			});
		}

		return route.fulfill({ status: 200, body: "{}" });
	});

	return {
		get usersMeCalls() { return usersMeCalls; },
		get deleteCalls() { return deleteCalls; },
	};
}

test.describe("401 token expiry handling", () => {
	/**
	 * API call gets a 401, the interceptor refreshes the access token,
	 * retries the request, and the caller sees a successful response.
	 * The 401 is completely transparent to the user.
	 */
	test("transparently retries after successful token refresh", async ({
		page,
	}) => {
		const counts = await setupRoutes(page, {
			usersMeStatus: (n) => n === 1 ? 401 : 200,
		});

		await page.addInitScript(() => {
			localStorage.setItem("userId", "test-user-1");
			localStorage.setItem("expiresAt",
				new Date(Date.now() + 86400000).toString());
			localStorage.setItem("refreshExpiresAt",
				new Date(Date.now() + 86400000 * 7).toString());
		});

		await page.goto("/profile");

		await expect(page.getByText("Test User")).toBeVisible();
		const main = page.getByRole("main");
		await expect(main.getByText("5", { exact: true })).toBeVisible();
		await expect(main.getByText("12", { exact: true })).toBeVisible();
		expect(counts.usersMeCalls).toBe(2); // original 401 + retry
	});

	/**
	 * When the refresh token itself is expired, pages that require login
	 * redirect to /login immediately on render — no API call needed.
	 */
	test("redirects to login from the add page when refresh token is expired", async ({
		page,
	}) => {
		await setupRoutes(page);

		await page.addInitScript(() => {
			localStorage.setItem("userId", "test-user-1");
			localStorage.setItem("expiresAt",
				new Date(Date.now() - 1).toString());
			localStorage.setItem("refreshExpiresAt",
				new Date(Date.now() - 1).toString());
		});

		const loginNav = page.waitForRequest(
			(req) => req.url().includes("/login"),
			{ timeout: 15000 },
		);

		await page.goto("/add");

		const req = await loginNav;
		expect(req.url()).toContain("/login");
	});

	test("redirects to login from the edit page when refresh token is expired", async ({
		page,
	}) => {
		await setupRoutes(page);

		await page.addInitScript(() => {
			localStorage.setItem("userId", "test-user-1");
			localStorage.setItem("expiresAt",
				new Date(Date.now() - 1).toString());
			localStorage.setItem("refreshExpiresAt",
				new Date(Date.now() - 1).toString());
		});

		const loginNav = page.waitForRequest(
			(req) => req.url().includes("/login"),
			{ timeout: 15000 },
		);

		await page.goto("/edit/some-slug");

		const req = await loginNav;
		expect(req.url()).toContain("/login");
	});

	/**
	 * When the refresh token is expired on a page that works without auth,
	 * the page falls back to anonymous endpoints instead of redirecting.
	 */
	test("falls back to anonymous content when refresh token is expired", async ({
		page,
	}) => {
		await setupRoutes(page);

		await page.addInitScript(() => {
			localStorage.setItem("userId", "test-user-1");
			localStorage.setItem("expiresAt",
				new Date(Date.now() - 1).toString());
			localStorage.setItem("refreshExpiresAt",
				new Date(Date.now() - 1).toString());
		});

		await page.goto("/recipes");

		await expect(page.getByText("Pasta Carbonara")).toBeVisible({
			timeout: 10000,
		});
	});

	/**
	 * After the interceptor refreshes the access token on one API call,
	 * the new expiry is saved to localStorage and subsequent calls don't
	 * hit 401s.
	 */
	test("subsequent API calls use the refreshed token", async ({ page }) => {
		const counts = await setupRoutes(page, {
			usersMeStatus: (n) => n === 1 ? 401 : 200,
		});

		await page.addInitScript(() => {
			localStorage.setItem("userId", "test-user-1");
			localStorage.setItem("expiresAt",
				new Date(Date.now() + 86400000).toString());
			localStorage.setItem("refreshExpiresAt",
				new Date(Date.now() + 86400000 * 7).toString());
		});

		await page.goto("/profile");
		await expect(page.getByText("Test User")).toBeVisible();

		// Trigger a second authenticated call (delete account).
		const loginNav = page.waitForRequest(
			(req) => req.url().includes("/login"),
			{ timeout: 15000 },
		);

		await page.getByRole("button", { name: /Delete My Account/i }).click();
		await page.getByRole("button", { name: /^Delete$/ }).click();

		const req = await loginNav;
		expect(req.url()).toContain("/login");
		expect(counts.usersMeCalls).toBe(2); // original 401 + retry
		expect(counts.deleteCalls).toBe(1); // no 401 — token was fresh
	});
});
