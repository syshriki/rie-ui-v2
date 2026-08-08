import { expect, test } from "@playwright/test";
import { mockApiRoutes, mockAuthenticatedUser } from "../helpers";

test.describe("Edit recipe page — layout", () => {
	test.describe("mobile (600x900)", () => {
		test.use({ viewport: { width: 600, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await mockAuthenticatedUser(page, "user1");
			await page.goto("/edit/pasta-carbonara");
		});

		test("shows mobile layout", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: "Show Menu" }),
			).toBeVisible();
		});

		test("shows page content", async ({ page }) => {
			await expect(
				page.getByPlaceholder("Enter recipe name"),
			).toBeVisible({ timeout: 10000 });
			await expect(
				page.getByPlaceholder("Brief description of the recipe"),
			).toBeVisible();
			await expect(
				page.getByPlaceholder("Enter the full recipe"),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: /Update Recipe/ }),
			).toBeVisible();
		});
	});

	test.describe("tablet (900x900)", () => {
		test.use({ viewport: { width: 900, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await mockAuthenticatedUser(page, "user1");
			await page.goto("/edit/pasta-carbonara");
		});

		test("shows tablet layout", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: "Show Menu" }),
			).toBeHidden();
			await expect(
				page.getByRole("heading", { name: "Edit Recipe" }),
			).toBeHidden();
		});

		test("shows page content", async ({ page }) => {
			await expect(
				page.getByPlaceholder("Enter recipe name"),
			).toBeVisible({ timeout: 10000 });
			await expect(
				page.getByPlaceholder("Brief description of the recipe"),
			).toBeVisible();
			await expect(
				page.getByPlaceholder("Enter the full recipe"),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: /Update Recipe/ }),
			).toBeVisible();
		});
	});

	test.describe("desktop (1440x900)", () => {
		test.use({ viewport: { width: 1440, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await mockAuthenticatedUser(page, "user1");
			await page.goto("/edit/pasta-carbonara");
		});

		test("shows desktop layout", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: "Show Menu" }),
			).toBeHidden();
			await expect(
				page.getByRole("heading", { name: "Edit Recipe" }),
			).toBeVisible();
		});

		test("shows page content", async ({ page }) => {
			await expect(
				page.getByRole("heading", { name: "Edit Recipe" }),
			).toBeVisible();
			await expect(
				page.getByPlaceholder("Enter recipe name"),
			).toBeVisible({ timeout: 10000 });
			await expect(
				page.getByPlaceholder("Brief description of the recipe"),
			).toBeVisible();
			await expect(
				page.getByPlaceholder("Enter the full recipe"),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: /Update Recipe/ }),
			).toBeVisible();
		});
	});
});
