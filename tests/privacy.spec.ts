import { expect, test } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

test.describe("Privacy page", () => {
	test.beforeEach(async ({ page }) => {
		await mockApiRoutes(page);
		await page.goto("/privacy");
	});

	test("renders the privacy policy heading", async ({ page }) => {
		await expect(
			page.getByRole("heading", { name: "Privacy Policy" }),
		).toBeVisible();
	});

	test("shows the last updated date", async ({ page }) => {
		await expect(
			page.getByText(/Last updated:/i),
		).toBeVisible();
	});

	test("shows key sections", async ({ page }) => {
		await expect(page.getByRole("heading", { name: "1. Information We Collect" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "2. How We Use Your Information" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "3. Authentication & Third-Party Services" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "4. Data Storage & Security" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "5. Your Rights" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "6. Cookies & Local Storage" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "7. Children's Privacy" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "8. Changes to This Policy" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "9. Contact Us" })).toBeVisible();
	});

	test("shows contact email", async ({ page }) => {
		await expect(
			page.getByText("shlomo@rie.recipes"),
		).toBeVisible();
	});
});
