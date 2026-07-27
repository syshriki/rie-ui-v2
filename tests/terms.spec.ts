import { expect, test } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

test.describe("Terms of Service page", () => {
	test.beforeEach(async ({ page }) => {
		await mockApiRoutes(page);
		await page.goto("/terms");
	});

	test("renders the terms of service heading", async ({ page }) => {
		await expect(
			page.getByRole("heading", { name: "Terms of Service" }),
		).toBeVisible();
	});

	test("shows the last updated date", async ({ page }) => {
		await expect(
			page.getByText(/Last updated:/i),
		).toBeVisible();
	});

	test("shows SY&S Consulting as the operator", async ({ page }) => {
		await expect(
			page.getByText(/SY&S Consulting/).first(),
		).toBeVisible();
	});

	test("shows all sections", async ({ page }) => {
		const sections = [
			"1. Acceptance of Terms",
			"2. Description of Service",
			"3. User Accounts",
			"4. User Content",
			"5. Acceptable Use",
			"6. Intellectual Property",
			"7. Termination",
			"8. Disclaimer of Warranties",
			"9. Limitation of Liability",
			"10. Changes to These Terms",
			"11. Contact",
		];
		for (const section of sections) {
			await expect(
				page.getByRole("heading", { name: section }),
			).toBeVisible();
		}
	});

	test("shows contact email", async ({ page }) => {
		await expect(
			page.getByText("shlomo@rie.recipes"),
		).toBeVisible();
	});

	test("links to privacy policy", async ({ page }) => {
		const link = page.getByRole("main").getByRole("link", { name: "Privacy Policy" });
		await expect(link).toBeVisible();
		await expect(link).toHaveAttribute("href", "/privacy");
	});
});
