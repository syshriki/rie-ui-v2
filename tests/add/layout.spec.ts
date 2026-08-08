import { expect, test } from "@playwright/test";
import { mockApiRoutes, mockAuthenticatedUser } from "../helpers";

test.describe("Add recipe page — layout", () => {
	test.describe("mobile (600x900)", () => {
		test.use({ viewport: { width: 600, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await mockAuthenticatedUser(page, "user1");
			await page.goto("/add");
		});

		test("shows mobile layout", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: "Show Menu" }),
			).toBeVisible();
		});

		test("shows page content", async ({ page }) => {
			await expect(
				page.getByPlaceholder("Recipe Name"),
			).toBeVisible();
			await expect(
				page.getByPlaceholder("Description (Optional)"),
			).toBeVisible();
			await expect(
				page.getByPlaceholder("Recipe", { exact: true }),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: /Save/ }),
			).toBeVisible();
		});
	});

	test.describe("tablet (900x900)", () => {
		test.use({ viewport: { width: 900, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await mockAuthenticatedUser(page, "user1");
			await page.goto("/add");
		});

		test("shows tablet layout", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: "Show Menu" }),
			).toBeHidden();
			await expect(
				page.getByRole("heading", { name: "Add Recipe" }),
			).toBeHidden();
		});

		test("shows page content", async ({ page }) => {
			await expect(
				page.getByPlaceholder("Recipe Name"),
			).toBeVisible();
			await expect(
				page.getByPlaceholder("Description (Optional)"),
			).toBeVisible();
			await expect(
				page.getByPlaceholder("Recipe", { exact: true }),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: /Save/ }),
			).toBeVisible();
		});
	});

	test.describe("desktop (1440x900)", () => {
		test.use({ viewport: { width: 1440, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await mockAuthenticatedUser(page, "user1");
			await page.goto("/add");
		});

		test("shows desktop layout", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: "Show Menu" }),
			).toBeHidden();
			await expect(
				page.getByRole("heading", { name: "Add Recipe" }),
			).toBeVisible();
		});

		test("shows page content", async ({ page }) => {
			await expect(
				page.getByRole("heading", { name: "Add Recipe" }),
			).toBeVisible();
			await expect(
				page.getByPlaceholder("Recipe Name"),
			).toBeVisible();
			await expect(
				page.getByPlaceholder("Description (Optional)"),
			).toBeVisible();
			await expect(
				page.getByPlaceholder("Recipe", { exact: true }),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: /Save/ }),
			).toBeVisible();
		});
	});
});
