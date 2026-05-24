import { expect, test } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

test.describe("Login page", () => {
	test.beforeEach(async ({ page }) => {
		await mockApiRoutes(page);
		await page.goto("/login");
	});

	test("renders the welcome heading", async ({ page }) => {
		await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Rie.recipes" }).first(),
		).toBeVisible();
	});

	test("shows Facebook and Reddit login buttons", async ({ page }) => {
		await expect(
			page.getByRole("button", { name: /Continue With Facebook/i }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: /Continue With Reddit/i }),
		).toBeVisible();
	});

	test("Google and Yahoo buttons are disabled", async ({ page }) => {
		await expect(
			page.getByRole("button", { name: /Continue With Google/i }),
		).toBeDisabled();
		await expect(
			page.getByRole("button", { name: /Continue With Yahoo/i }),
		).toBeDisabled();
	});

	test("shows Continue Anonymously button", async ({ page }) => {
		await expect(
			page.getByRole("button", { name: /Continue Anonymously/i }),
		).toBeVisible();
	});

	test("Continue Anonymously navigates to recipes", async ({ page }) => {
		await page
			.getByRole("button", { name: /Continue Anonymously/i })
			.click();
		await expect(page).toHaveURL(/\/recipes/);
	});
});
