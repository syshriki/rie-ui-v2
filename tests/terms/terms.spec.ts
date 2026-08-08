import { expect, test } from "@playwright/test";
import { mockApiRoutes } from "../helpers";

test.describe("Terms of Service page", () => {
	test.beforeEach(async ({ page }) => {
		await mockApiRoutes(page);
		await page.goto("/terms");
	});

	test("links to privacy policy", async ({ page }) => {
		const link = page.getByRole("main").getByRole("link", { name: "Privacy Policy" });
		await expect(link).toBeVisible();
		await expect(link).toHaveAttribute("href", "/privacy");
	});
});
