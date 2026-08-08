import { expect, test } from "@playwright/test";
import { mockApiRoutes } from "../helpers";

test.describe("Login page", () => {
	test.beforeEach(async ({ page }) => {
		await mockApiRoutes(page);
		await page.goto("/login");
	});

	test("Continue Anonymously navigates to recipes", async ({ page }) => {
		await page
			.getByRole("button", { name: /Continue Anonymously/i })
			.click();
		await expect(page).toHaveURL(/\/recipes/);
	});
});
