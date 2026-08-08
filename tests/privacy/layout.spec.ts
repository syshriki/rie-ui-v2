import { expect, test } from "@playwright/test";
import { mockApiRoutes } from "../helpers";

test.describe("Privacy page — layout", () => {
	test.describe("mobile (600x900)", () => {
		test.use({ viewport: { width: 600, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await page.goto("/privacy");
		});

		test("shows mobile layout", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: "Show Menu" }),
			).toBeVisible();
		});

		test("shows page content", async ({ page }) => {
			await expect(page.getByText("Last updated:")).toBeVisible();
			await expect(
				page.getByRole("heading", {
					name: "1. Information We Collect",
				}),
			).toBeVisible();
			await expect(
				page.getByText(/shlomo@rie\.recipes/),
			).toBeVisible();
		});
	});

	test.describe("tablet (900x900)", () => {
		test.use({ viewport: { width: 900, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await page.goto("/privacy");
		});

		test("shows tablet layout", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: "Show Menu" }),
			).toBeHidden();
			await expect(
				page.getByRole("heading", { name: "Privacy Policy" }),
			).toBeHidden();
		});

		test("shows page content", async ({ page }) => {
			await expect(page.getByText("Last updated:")).toBeVisible();
			await expect(
				page.getByRole("heading", {
					name: "1. Information We Collect",
				}),
			).toBeVisible();
			await expect(
				page.getByText(/shlomo@rie\.recipes/),
			).toBeVisible();
		});
	});

	test.describe("desktop (1440x900)", () => {
		test.use({ viewport: { width: 1440, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await page.goto("/privacy");
		});

		test("shows desktop layout", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: "Show Menu" }),
			).toBeHidden();
			await expect(
				page.getByRole("heading", { name: "Privacy Policy" }),
			).toBeVisible();
		});

		test("shows page content", async ({ page }) => {
			await expect(
				page.getByRole("heading", { name: "Privacy Policy" }),
			).toBeVisible();
			await expect(page.getByText("Last updated:")).toBeVisible();
			await expect(
				page.getByRole("heading", {
					name: "1. Information We Collect",
				}),
			).toBeVisible();
			await expect(
				page.getByText(/shlomo@rie\.recipes/),
			).toBeVisible();
		});
	});
});
