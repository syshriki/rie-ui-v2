import { expect, test } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

test.describe("Recipe detail page", () => {
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
