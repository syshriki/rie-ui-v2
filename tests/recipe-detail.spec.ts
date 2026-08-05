import { expect, test } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

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

		test("print button is visible on recipe detail page", async ({ page }) => {
			await page.goto("/recipes");

			const firstRecipeLink = page
				.locator("a")
				.filter({ has: page.locator("h3") })
				.first();
			await expect(firstRecipeLink).toBeVisible({ timeout: 10000 });
			await firstRecipeLink.click();

			await expect(page).toHaveURL(/\/[^/]+$/);
			await expect(
				page.getByRole("img", { name: /Print Recipe/i }).first(),
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
				page.getByRole("img", { name: "Edit Recipe" }),
			).toBeVisible({ timeout: 10000 });
			await expect(
				page.getByRole("img", { name: "Delete Recipe" }),
			).toBeVisible({ timeout: 10000 });
		});
	});
});
