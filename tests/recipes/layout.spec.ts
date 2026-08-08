import { expect, test } from "@playwright/test";
import { mockApiRoutes } from "../helpers";

test.describe("Recipes page — layout", () => {
	test.describe("mobile (600x900)", () => {
		test.use({ viewport: { width: 600, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await page.goto("/recipes");
		});

		test("shows mobile layout", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: "Show Menu" }),
			).toBeVisible();
			await expect(
				page.getByRole("heading", { name: "Recipes" }),
			).toBeHidden();
		});

		test("shows page content", async ({ page }) => {
			await expect(page.getByRole("searchbox")).toBeVisible();
			await expect(page.getByRole("searchbox")).toHaveAttribute(
				"placeholder",
				"Search recipes...",
			);
			await expect(
				page.getByRole("button", { name: /Submit/i }),
			).toBeVisible();
			await expect(
				page.getByRole("heading", { name: "Pasta Carbonara" }),
			).toBeVisible({ timeout: 10000 });
			await expect(
				page.getByRole("navigation", { name: "pagination" }),
			).toBeVisible();
		});
	});

	test.describe("tablet (900x900)", () => {
		test.use({ viewport: { width: 900, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await page.goto("/recipes");
		});

		test("shows tablet layout", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: "Show Menu" }),
			).toBeHidden();
			await expect(
				page.getByRole("heading", { name: "Recipes" }),
			).toBeHidden();
		});

		test("shows page content", async ({ page }) => {
			await expect(page.getByRole("searchbox")).toBeVisible();
			await expect(page.getByRole("searchbox")).toHaveAttribute(
				"placeholder",
				"Search recipes...",
			);
			await expect(
				page.getByRole("button", { name: /Submit/i }),
			).toBeVisible();
			await expect(
				page.getByRole("heading", { name: "Pasta Carbonara" }),
			).toBeVisible({ timeout: 10000 });
			await expect(
				page.getByRole("navigation", { name: "pagination" }),
			).toBeVisible();
		});
	});

	test.describe("desktop (1440x900)", () => {
		test.use({ viewport: { width: 1440, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await page.goto("/recipes");
		});

		test("shows desktop layout", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: "Show Menu" }),
			).toBeHidden();
			await expect(
				page.getByRole("heading", { name: "Recipes" }),
			).toBeVisible();
		});

		test("shows page content", async ({ page }) => {
			await expect(page.getByRole("searchbox")).toBeVisible();
			await expect(page.getByRole("searchbox")).toHaveAttribute(
				"placeholder",
				"Search recipes...",
			);
			await expect(
				page.getByRole("button", { name: /Submit/i }),
			).toBeVisible();
			await expect(
				page.getByRole("heading", { name: "Pasta Carbonara" }),
			).toBeVisible({ timeout: 10000 });
			await expect(
				page.getByRole("navigation", { name: "pagination" }),
			).toBeVisible();
		});
	});
});
